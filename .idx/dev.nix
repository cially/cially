# To learn more about how to use Nix to configure your environment
# see: https://firebase.google.com/docs/studio/customize-workspace
{ pkgs, ... }: {
  # Which nixpkgs channel to use.
  channel = "stable-25.05"; # or "unstable"

  # Use https://search.nixos.org/packages to find packages
  packages = [
    pkgs.mise
    pkgs.nodejs
    pkgs.corepack
    pkgs.pnpm
    pkgs.go
    pkgs.python313
    pkgs.docker
    pkgs.docker-compose
    pkgs.docker-buildx
  ];

  services.docker.enable = true;

  # Sets environment variables in the workspace
  env = {};
  
  idx = {
    # Search for the extensions you want on https://open-vsx.org/ and use "publisher.id"
    extensions = [
      # "vscodevim.vim"
    ];

    # Enable previews
    previews = {
      enable = true;
      previews = {
        # web = {
        #   # Example: run "npm run dev" with PORT set to IDX's defined port for previews,
        #   # and show it in IDX's web preview panel
        #   command = ["npm" "run" "dev"];
        #   manager = "web";
        #   env = {
        #     # Environment variables to set for your server
        #     PORT = "$PORT";
        #   };
        # };
      };
    };

    # Workspace lifecycle hooks
    workspace = {
      # Runs when a workspace is first created
      onCreate = {
        pnpm-setup = "pnpm setup";
        ni-install = "pnpm -g install @antfu/ni";
        pnpm-install = "ni";
      };
      # Runs when the workspace is (re)started
      onStart = {
        pnpm-setup = "pnpm setup";
        corepack-enable = "corepack enable";
      };
    };
  };
}
