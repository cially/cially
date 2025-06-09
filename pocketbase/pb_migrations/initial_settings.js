/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
    let superusers = app.findCollectionByNameOrId("_superusers")
  
      let record = new Record(superusers)
  
      record.set("email", $os.getenv("SUPERUSER_EMAIL") || "admin@cially.org")
      record.set("password", $os.getenv("SUPERUSER_PASSWORD") || "admin")
  
      app.save(record)
  }, (app) => {
    // add down queries...
  })
  