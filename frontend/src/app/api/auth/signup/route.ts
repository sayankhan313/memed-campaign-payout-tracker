
import { NextRequest, NextResponse } from "next/server";

type BackendUser = {
  id: string;
  name: string;
  email: string;
  role: "brand" | "creator";
  instagramUsername?: string;
  youtubeChannelUrl?: string;
};

type BackendSignupResponse = {
  success?: boolean;
  message?: string;
  errors?: {
    field: string;
    message: string;
  }[];
  data?: {
    message?: string;
    accessToken?: string;
    user?: BackendUser;
  };
};

export async function POST(request: NextRequest) {
  try {
    let input: Record<string, unknown>;

    try {
      const body: unknown = await request.json();

      if (!body || typeof body !== "object" || Array.isArray(body)) {
        throw new Error("Invalid body");
      }

      input = body as Record<string, unknown>;
    } catch {
      return NextResponse.json(
        { success: false, message: "Invalid request body." },
        { status: 400 }
      );
    }

    const { name, email, password, role, instagramUsername, youtubeChannelUrl } = input;

    if (
      typeof name !== "string" ||
      typeof email !== "string" ||
      typeof password !== "string" ||
      (role !== "brand" && role !== "creator")
    ) {
      return NextResponse.json(
        { success: false, message: "Please provide valid signup details." },
        { status: 400 }
      );
    }

    if (role === "creator" && (
      (instagramUsername !== undefined && typeof instagramUsername !== "string") ||
      (youtubeChannelUrl !== undefined && typeof youtubeChannelUrl !== "string")
    )) {
      return NextResponse.json({ success: false, message: "Invalid Creator profile details." }, { status: 400 });
    }

    const backendUrl = (
      process.env.BACKEND_URL || "http://127.0.0.1:5001"
    ).replace(/\/$/, "");

    const backendResponse = await fetch(`${backendUrl}/api/auth/signup`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: name.trim(),
        email: email.trim().toLowerCase(),
        password,
        role,
        ...(role === "creator" ? {
          instagramUsername: typeof instagramUsername === "string" ? instagramUsername.trim() : undefined,
          youtubeChannelUrl: typeof youtubeChannelUrl === "string" ? youtubeChannelUrl.trim() : undefined,
        } : {}),
      }),
      cache: "no-store",
      signal: AbortSignal.timeout(12000),
    });

    const result = (await backendResponse
      .json()
      .catch(() => null)) as BackendSignupResponse | null;

    if (!backendResponse.ok || !result?.success) {
      return NextResponse.json(
        {
          success: false,
          message: result?.message || "Unable to create your account.",
          errors: result?.errors || [],
        },
        {
          status: backendResponse.ok ? 400 : backendResponse.status,
        }
      );
    }

    const token = result.data?.accessToken;
    const user = result.data?.user;

    if (!token || !user) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid authentication response from the server.",
        },
        { status: 502 }
      );
    }

    if (user.role !== "brand" && user.role !== "creator") {
      return NextResponse.json(
        {
          success: false,
          message: "Unsupported account role.",
        },
        { status: 403 }
      );
    }

    const response = NextResponse.json(
      {
        success: true,
        message: "Account created successfully.",
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          ...(user.role === "creator" ? {
            instagramUsername: user.instagramUsername,
            youtubeChannelUrl: user.youtubeChannelUrl,
          } : {}),
        },
      },
      { status: 201 }
    );

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
        {
          success: false,
          message: "Request timed out. Please try again.",
        },
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
