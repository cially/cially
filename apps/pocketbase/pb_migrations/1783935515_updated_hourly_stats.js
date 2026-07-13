/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_2634241399")

  // add field
  collection.fields.addAt(8, new Field({
    "help": "",
    "hidden": false,
    "id": "number2368255389",
    "max": null,
    "min": null,
    "name": "vc_joins",
    "onlyInt": false,
    "presentable": false,
    "required": false,
    "system": false,
    "type": "number"
  }))

  // add field
  collection.fields.addAt(9, new Field({
    "help": "",
    "hidden": false,
    "id": "number3268254731",
    "max": null,
    "min": null,
    "name": "vc_leaves",
    "onlyInt": false,
    "presentable": false,
    "required": false,
    "system": false,
    "type": "number"
  }))

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_2634241399")

  // remove field
  collection.fields.removeById("number2368255389")

  // remove field
  collection.fields.removeById("number3268254731")

  return app.save(collection)
})
