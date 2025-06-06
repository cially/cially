/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_908605521")

  // add field
  collection.fields.addAt(4, new Field({
    "hidden": false,
    "id": "bool1823123106",
    "name": "logged",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "bool"
  }))

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_908605521")

  // remove field
  collection.fields.removeById("bool1823123106")

  return app.save(collection)
})
