/// <reference path="../pb_data/types.d.ts" />
migrate(
  (app) => {
    // initial settings
    const settings = app.settings();

    settings.meta.appName = "Cially";
    settings.meta.hideControls = true;
    settings.logs.minLevel = 4;

    app.save(settings);

    // create superuser
    const superusers = app.findCollectionByNameOrId("_superusers");

    const record = new Record(superusers);

    record.set(
      "email",
      $os.getenv("POCKETBASE_ADMIN_EMAIL") || "admin@cially.org",
    );
    record.set("password", $os.getenv("POCKETBASE_ADMIN_PASSWORD") || "admin123!");

    app.save(record);
  },
  (app) => {
    // add down queries...
  },
);
