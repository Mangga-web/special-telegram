import { minVersion } from "semver";
import { fetchJson } from "./fetch";

type VsCodePackageJson = {
  devDependencies?: {
    electron?: string;
  };
  nativeBuild?: {
    target?: string;
  };
};

async function getVsCodePackageJson(
  version: string,
): Promise<VsCodePackageJson> {
  return await fetchJson(
    `https://raw.githubusercontent.com/microsoft/vscode/${version}/package.json`,
  );
}

interface ElectronVersion {
  version: string;
  date: string;
  node: string;
  v8: string;
  uv: string;
  zlib: string;
  openssl: string;
  modules: string;
  chrome: string;
  files: string[];
  body?: string;
  apm?: string;
}

async function getElectronReleases(): Promise<ElectronVersion[]> {
  return await fetchJson("https://releases.electronjs.org/releases.json");
}

type VersionInformation = {
  vscodeVersion: string;
  electronVersion: string;
  nodeVersion: string;
  chromiumVersion: string;
};

function getElectronVersion(
  vsCodePackageJson: VsCodePackageJson,
): string | undefined {
  const electronRange = vsCodePackageJson.devDependencies?.electron;
  if (electronRange) {
    return minVersion(electronRange)?.version;
  }
  // Newer VS Code releases no longer list Electron in devDependencies and
  // instead pin the exact version in nativeBuild.target.
  return vsCodePackageJson.nativeBuild?.target;
}

export async function getVersionInformation(
  vscodeVersion: string,
): Promise<VersionInformation> {
  const vsCodePackageJson = await getVsCodePackageJson(vscodeVersion);
  const electronVersion = getElectronVersion(vsCodePackageJson);
  if (!electronVersion) {
    throw new Error("Could not find Electron version");
  }

  const electronReleases = await getElectronReleases();

  const electronRelease = electronReleases.find(
    (release) => release.version === electronVersion,
  );
  if (!electronRelease) {
    throw new Error(`Could not find Electron release ${electronVersion}`);
  }

  return {
    vscodeVersion,
    electronVersion,
    nodeVersion: electronRelease.node,
    chromiumVersion: electronRelease.chrome,
  };
}
