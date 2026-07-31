/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_2634241399")

  // update field
  collection.fields.addAt(8, new Field({
    "hidden": false,
    "id": "autodate3342387181",
    "name": "created",
    "onCreate": true,
    "onUpdate": false,
    "presentable": false,
    "system": false,
    "type": "autodate"
  }))

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_2634241399")

  // update field
  collection.fields.addAt(8, new Field({
    "hidden": false,
    "id": "autodate3342387181",
    "name": "autodate",
    "onCreate": true,
    "onUpdate": false,
    "presentable": false,
    "system": false,
    "type": "autodate"
  }))

  return app.save(collection)
})
