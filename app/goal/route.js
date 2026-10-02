import { NextResponse } from "next/server";
import { generateGoalImage } from "../../lib/generator";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);

    const buffer = await generateGoalImage({
      goal: searchParams.get("goal") || "My Goal",
      startDate: searchParams.get("start_date"),
      goalDate: searchParams.get("goal_date"),
      width: searchParams.get("width"),
      height: searchParams.get("height"),

      background: searchParams.get("background"),

      completedColor: searchParams.get("completed_color"),
      remainingColor: searchParams.get("remaining_color"),
      todayColor: searchParams.get("today_color"),
      textColor: searchParams.get("text_color"),
      subtitleColor: searchParams.get("subtitle_color"),

      dotSize: searchParams.get("dot_size"),
      dotGap: searchParams.get("dot_gap"),
      topMargin: searchParams.get("top_margin"),
      sideMargin: searchParams.get("side_margin"),
      titleSize: searchParams.get("title_size"),
      subtitleSize: searchParams.get("subtitle_size"),
      showSubtitle: searchParams.get("show_subtitle"),

      opacity: searchParams.get("opacity")
    });

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        "Content-Type": "image/png",
        "Cache-Control": "no-store, max-age=0",
        "Content-Disposition": 'inline; filename="life-calendar.png"'
      }
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: error?.message || "Unable to generate calendar image."
      },
      { status: 400 }
    );
  }
}
