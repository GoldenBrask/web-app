import { NextResponse } from "next/server"
import { applicationService } from "@/lib/server-database"

export async function POST(request: Request) {
  try {
    const data = await request.json()

    const application = await applicationService.create({
      job_offer_id: data.jobOfferId,
      first_name: data.firstName,
      last_name: data.lastName,
      email: data.email,
      phone: data.phone,
      level: data.level,
      motivation: data.motivation,
      status: "pending",
    })

    return NextResponse.json(application, { status: 201 })
  } catch (error) {
    console.error("Error creating application:", error)
    return NextResponse.json({ error: "Failed to create application" }, { status: 500 })
  }
}
