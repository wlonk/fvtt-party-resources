import ResourcesList from "./../resources_list.mjs";
import ResourceForm from "./resource_form.mjs";

export default class ResourcesDashboard extends Application {
  static get defaultOptions() {
    return mergeObject(super.defaultOptions, {
      id: "fvtt-party-resources-dashboard",
      classes: ["fvtt-party-resources"],
      template: "modules/fvtt-party-resources/templates/resources_dashboard.html",
      minimizable: true,
      resizable: true,
      title: game.i18n.localize("FvttPartyResources.Title")
    })
  }

  activateListeners(html) {
    super.activateListeners(html)

    html.on('click', '.change-value.add', event => {
      this.setup_calculation(event, (setting, jump) => { PartyResourcesApi.increment(setting, jump) })
    })

    html.on('click', '.change-value.subtract', event => {
      this.setup_calculation(event, (setting, jump) => { PartyResourcesApi.decrement(setting, jump) })
    })

    html.on('click', '.delete', event => {
      this.setup_calculation(event, setting => { ResourcesList.remove(setting) })
    })

    html.on('click', '.make-visible, .make-invisible', event => {
      this.setup_calculation(event, setting => { this.toggle_visiblity(setting) })
    })

    html.on('click', '.new-resource-form-btn', event => {
      new ResourceForm(
        {},
        {
          id: "add-resource-form",
          title: game.i18n.localize("FvttPartyResources.ResourceForm.AddFormTitle")
        }
      ).render(true)
    })

    html.on('click', '.edit', event => {
      event.stopPropagation()
      event.preventDefault()

      new ResourceForm(
        this.resource_data($(event.currentTarget).data('setting')),
        {
          id: "edit-resource-form",
          title: game.i18n.localize("FvttPartyResources.ResourceForm.EditFormTitle")
        }
      ).render(true)
    })
  }

  getData() {
    return mergeObject(PartyResourcesApi.resources(), { is_gm: game.user.isGM })
  }

  setup_calculation(event, process) {
    event.stopPropagation()
    event.preventDefault()

    let jump = 1
    if(event.ctrlKey || event.metaKey) jump = 10
    if(event.shiftKey) jump = 100
    process($(event.currentTarget).data('setting'), jump)
  }

  toggle_visiblity(setting) {
    PartyResourcesApi.set(
      setting.concat('_visible'),
      !PartyResourcesApi.get(setting.concat('_visible'))
    )
  }

  // Deprecated and no longer in use since v1.1
  // Leaving it here as a means to a "reset window size" button or something.
  recalculate_height() {
    $('#fvtt-party-resources-dashboard').css({
      width: 'auto',
      height: 'auto'
    })
  }

  redraw(force) {
    this.render(force)
  }

  resource_data(id) {
    return {
      identifier: id,
      default_value: PartyResourcesApi.get(id),
      name: PartyResourcesApi.get(id.concat('_name')),
      max_value: PartyResourcesApi.get(id.concat('_max')),
      min_value: PartyResourcesApi.get(id.concat('_min')),
      player_managed: PartyResourcesApi.get(id.concat('_player_managed')),
      allowed_to_modify_settings: game.permissions.SETTINGS_MODIFY.includes(1),
      visible: PartyResourcesApi.get(id.concat('_visible'))
    }
  }

}
