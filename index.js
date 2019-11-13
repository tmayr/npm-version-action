const { Toolkit } = require("actions-toolkit");

Toolkit.run(async tools => {
  const versionType = getVersionType(tools.context.payload.commits);

  try {
    // configure git
    await gitConfig(tools);

    // checkout currentBranch and bump version
    await npmVersion(tools, versionType);

    // push tags and changes
    await gitPush(tools);
  } catch (e) {
    tools.log.fatal(e);
    tools.exit.failure("Failed to bump version");
  }

  tools.exit.success("Version bumped!");
});

function getVersionType(commits) {
  const messages = commits.map(c => `${c.message}\n${c.body}`);

  let versionType = "patch";
  if (messages.find(message => message.includes("BREAKING CHANGE"))) {
    versionType = "major";
  } else if (
    messages.find(message => message.toLowerCase().startsWith("feat"))
  ) {
    versionType = "minor";
  }

  return versionType;
}

async function gitConfig(tools) {
  return Promise.all([
    tools.runInWorkspace("git", [
      "config",
      "user.name",
      "'Automated Version Bump'"
    ]),

    tools.runInWorkspace("git", [
      "config",
      "user.email",
      "'gh-action-npm-version@users.noreply.github.com'"
    ])
  ]);
}

async function npmVersion(tools, versionType) {
  const currentBranch = process.env.GITHUB_REF.replace(/refs\/.*\//, "");
  const commitMessage = "ci: version bump to";

  await tools.runInWorkspace("git", ["checkout", currentBranch]);
  return tools.runInWorkspace("npm", [
    "version",
    versionType,
    "-m",
    `${commitMessage} v%s`
  ]);
}

async function gitPush(tools) {
  const remoteRepo = `https://${process.env.GITHUB_ACTOR}:${process.env.GITHUB_TOKEN}@github.com/${process.env.GITHUB_REPOSITORY}.git`;

  return Promise.all([
    tools.runInWorkspace("git", ["push", remoteRepo]),
    tools.runInWorkspace("git", ["push", remoteRepo, "--tags"])
  ]);
}
