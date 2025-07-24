{pkgs}: {
  channel = "stable-25.05";
  packages = [
    pkgs.nodejs_24
    pkgs.pnpm
    pkgs.ni
    pkgs.turbo
    pkgs.go
  ];
  services = {
    docker.enable = true;
  };
  idx.extensions = [
    "biomejs.biome"
    "EditorConfig.EditorConfig"
    "usernamehw.errorlens"
    "tamasfe.even-better-toml"
    "YoavBls.pretty-ts-errors"
    "Codeium.codeium"
    "castrogusttavo.symbols"
    "antfu.icons-carbon"
    "antfu.file-nesting"
    "bradlc.vscode-tailwindcss"
    "golang.go"
  ];
}