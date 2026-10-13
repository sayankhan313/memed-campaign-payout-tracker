
import { NextRequest, NextResponse } from "next/server";

type BackendUser = {
  id: string;
  name: string;
  email: string;
  role: string;
  instagramUsername?: string;
  youtubeChannelUrl?: string;
};

type BackendLoginResponse = {
  success?: boolean;
  message?: string;
  error?: string | { message?: string };
  data?: {
    accessToken?: string;
    user?: BackendUser;
  };
};

export async function POST(request: NextRequest) {
  try {
    let body: { email?: unknown; password?: unknown };

    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { success: false, message: "Invalid request body." },
        { status: 400 }
      );
    }

    if (typeof body.email !== "string" || typeof body.password !== "string") {
      return NextResponse.json(
        { success: false, message: "Email and password are required." },
        { status: 400 }
      );
    }

    const backendUrl = (
      process.env.BACKEND_URL || "http://127.0.0.1:5001"
    ).replace(/\/$/, "");

    const backendResponse = await fetch(`${backendUrl}/api/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: body.email,
        password: body.password,
      }),
      cache: "no-store",
      signal: AbortSignal.timeout(12000),
    });

    const result = (await backendResponse
      .json()
      .catch(() => null)) as BackendLoginResponse | null;

    if (!backendResponse.ok || !result?.success) {
      const errorMessage =
        result?.message ||
        (typeof result?.error === "string"
          ? result.error
          : result?.error?.message) ||
        "Invalid email or password.";

      return NextResponse.json(
        { success: false, message: errorMessage },
        { status: backendResponse.ok ? 401 : backendResponse.status }
      );
    }

    const token = result.data?.accessToken;
    const user = result.data?.user;

    if (!token || !user) {
      return NextResponse.json(
        { success: false, message: "Invalid authentication response." },
        { status: 502 }
      );
    }

    const role = user.role.toLowerCase();

    if (role !== "brand" && role !== "creator") {
      return NextResponse.json(
        { success: false, message: "Unsupported account role." },
        { status: 403 }
      );
    }

    const response = NextResponse.json({
      success: true,
      message: "Login successful",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role,
        ...(role === "creator" ? {
          instagramUsername: user.instagramUsername,
          youtubeChannelUrl: user.youtubeChannelUrl,
        } : {}),
      },
    });

    response.cookies.set({
      name: "memed_access_token",
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24,
    });

    response.headers.set("Cache-Control", "no-store");

    return response;
  } catch (error) {
    if (error instanceof Error && error.name === "TimeoutError") {
      return NextResponse.json(
        { success: false, message: "Login timed out. Please try again." },
        { status: 504 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        message: "Unable to connect to the authentication server.",
      },
      { status: 503 }
    );
  }
}
