package migrations

import (
	"os"
	"github.com/pocketbase/pocketbase/core"
	m "github.com/pocketbase/pocketbase/migrations"
)

var (
	adminEmail    = os.Getenv("POCKETBASE_ADMIN_EMAIL")
	adminPassword = os.Getenv("POCKETBASE_ADMIN_PASSWORD")
)

func init() {
	if adminEmail == "" {
		adminEmail = "admin@cially.org"
	}
	if adminPassword == "" {
		adminPassword = "admin123!"
	}
	m.Register(func(app core.App) error {
		// initial settings
		settings := app.Settings()
		settings.Meta.AppName = "Cially"
		settings.Meta.HideControls = true
		settings.Logs.MinLevel = 4
		if err := app.Save(settings); err != nil {
			return err
		}
		// create superuser
		collection, _ := app.FindCollectionByNameOrId(core.CollectionNameSuperusers)
		user := core.NewRecord(collection)
		user.SetEmail(adminEmail)
		user.SetPassword(adminPassword)
		return app.Save(user)
	}, nil)
}
