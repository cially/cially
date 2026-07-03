import { handleError } from "@/components/errorHandler";
import { handler } from "next/dist/server/route-modules/pages/builtin/_error";

const currentVersion = "v2.0.0";

export async function GET() {
  try {
    let rawGithubData = await fetch(
      "https://api.github.com/repos/cially/cially/releases/latest",
    );
    let githubData = await rawGithubData.json();
    let latestVersion = githubData.tag_name;
    let isPreRelease = githubData.prerelease;
    let isDraft = githubData.draft;

    let isUpdateAvailable =
      latestVersion != currentVersion && !isPreRelease && !isDraft
        ? true
        : false;

    let response = {
      isUpdateAvailable,
      currentVersion,
      latestVersion,
    };

    return Response.json({ code: 200, response: response });
  } catch (error) {
    console.log(error);
    handleError(error);
    return Response.json({ code: 500 });
  }
}
