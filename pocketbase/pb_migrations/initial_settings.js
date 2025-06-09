/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  // initial settings
  let settings = app.settings()

  settings.meta.appName = "Cially"
  settings.meta.hideControls = true
  settings.logs.minLevel = 4

  app.save(settings)

  // create superuser
  let superusers = app.findCollectionByNameOrId("_superusers")

  let record = new Record(superusers)

  record.set("email", $os.getenv("SUPERUSER_EMAIL") || "admin@cially.org")
  record.set("password", $os.getenv("SUPERUSER_PASSWORD") || "admin")

  app.save(record)
  }, (app) => {
    // add down queries...
  })
  