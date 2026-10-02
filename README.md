# Life Calendar API

A self-hosted Life/Goal Calendar image generator for Vercel.

It generates a PNG directly from a URL, so it works well with MacroDroid, Tasker, Android automation, wallpapers, dashboards, etc.

## 1. Deploy to Vercel

### GitHub

Create a GitHub repository and upload this project.

Then in Vercel:

1. Add New Project.
2. Import the GitHub repository.
3. Keep the detected framework as Next.js.
4. Deploy.

No database or environment variables are required.

## 2. Basic API

After deployment:

```text
https://YOUR-APP.vercel.app/goal?goal=175%20Days%20Hard&start_date=2026-09-27&goal_date=2027-03-20&width=1080&height=2640
```

The response is a PNG image.

There is also an equivalent API path:

```text
https://YOUR-APP.vercel.app/api/goal?goal=175%20Days%20Hard&start_date=2026-09-27&goal_date=2027-03-20&width=1080&height=2640
```

## 3. Custom background

Pass an externally hosted image:

```text
&background=https%3A%2F%2Fexample.com%2Fwallpaper.jpg
```

The image is resized with `cover` to fill the requested canvas.

For MacroDroid, URL-encode the background URL.

## 4. Appearance parameters

Optional parameters:

```text
completed_color=%23F2F2F2
remaining_color=%236E6E6E
today_color=%23FF9800
text_color=%23F2F2F2
subtitle_color=%23A8A8A8
dot_size=7
dot_gap=16
top_margin=210
side_margin=100
title_size=62
subtitle_size=30
show_subtitle=true
opacity=1
```

Example:

```text
https://YOUR-APP.vercel.app/goal?goal=175%20Days%20Hard&start_date=2026-09-27&goal_date=2027-03-20&width=1080&height=2640&completed_color=%23FFFFFF&remaining_color=%23666666&today_color=%23FF9800&dot_size=7&dot_gap=16
```

## 5. Date behavior

Dates use `YYYY-MM-DD`.

The calendar treats both the start date and goal date as included days.

For example:

```text
start_date=2026-09-27
goal_date=2027-03-20
```

The application automatically calculates the current day from the server's current UTC date.

This means MacroDroid can call the exact same URL every morning.

## 6. Background security

The `background` parameter accepts only `http://` and `https://` URLs.

For a permanent personal wallpaper, it is preferable to host the background on a stable public URL rather than using a temporary image URL.

## 7. MacroDroid

Use an HTTP GET/download action against:

```text
https://YOUR-APP.vercel.app/goal?goal=175%20Days%20Hard&start_date=2026-09-27&goal_date=2027-03-20&width=1080&height=2640
```

Save the returned response as a PNG and then use your existing wallpaper action.

## 8. Local development

Install Node.js 20+.

```bash
npm install
npm run dev
```

Open:

```text
http://localhost:3000/goal?goal=175%20Days%20Hard&start_date=2026-09-27&goal_date=2027-03-20&width=1080&height=2640
```

## Notes

- No database.
- No authentication.
- No cron job required.
- The calendar is generated when requested.
- `sharp` performs the final image composition.
- The default background is generated internally, so there are no binary assets required.
