
import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { randomInt } from "crypto";
import { z } from "zod";

const prisma = new PrismaClient();

const sendCodeSchema = z.object({
  email: z.string().email("Invalid email address"),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const result = sendCodeSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: "Invalid input", details: result.error.flatten() },
        { status: 400 }
      );
    }

    const { email } = result.data;

    // Generate 6-digit code
    const code = randomInt(100000, 999999).toString();
    const expires = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

    // Save to DB
    // We use 'upsert' logic manually or just create a new one.
    // The schema has @@unique([identifier, token]), but we want to invalidate old tokens for this identifier?
    // Actually, it's better to just create a new record. 
    // However, to prevent spam, we might want to check recent active tokens.
    // For MVP, we just create.

    await prisma.verificationToken.create({
      data: {
        identifier: email,
        token: code,
        expires,
        type: "EMAIL_REGISTER",
      },
    });

    // Dev mode: Print to console
    if (process.env.NODE_ENV !== "production") {
      console.log(`[DEV] Verification Code for ${email}: ${code}`);
    }

    // TODO: Integrate Nodemailer here for production

    return NextResponse.json({ message: "Verification code sent" });
  } catch (error) {
    console.error("Send code error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
