# Connect the results sheet

The page saves votes to a Google Sheet through a small Apps Script web app. Do this once.

1. Open [sheets.new](https://sheets.new) **signed in to your personal Google account**. A Northeastern account may only allow "Anyone within Northeastern", which makes graders sign in to Google and blocks saving from the page.
2. Name the sheet something like *NGN bullet grading*.
3. In the sheet, choose **Extensions → Apps Script**.
4. Delete what's in `Code.gs`, paste in everything from [`apps-script/Code.gs`](apps-script/Code.gs), and save.
5. Choose **Deploy → New deployment**. Click the gear next to *Select type* and pick **Web app**.
6. Set **Execute as: Me** and **Who has access: Anyone**, then click **Deploy**.
7. Google asks you to authorize. Choose your account, then **Advanced → Go to (project name)**, then **Allow**. The script only reads and writes this one spreadsheet.
8. Copy the **Web app URL**. It ends in `/exec`. Send it to Claude, which puts it into the page.

## What lands in the sheet

A **Responses** tab, one row per grader: name, team, whether they finished, when they last saved, then a pick column (Sent, Claude, Even or Skipped) and a note column for each of the 18 stories. Rows update as people grade, so you can watch it fill in.

Two columns are hidden: a random key that ties each row to a grader's browser, and the raw data the page reads back. Leave them alone, or the page won't find people's saved picks.

## The dashboard

Everyone sees the full results on the page once they finish all 18. To see them before you've graded, open the page with `#results` at the end of the link.

## If you change the script later

Use **Deploy → Manage deployments → Edit → Version: New version**. That keeps the same URL. A *new deployment* creates a new URL, which the page won't know about.
