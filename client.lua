local config = lib.load('config')
local display = false

local function sendNuiMessage(action, data)
    if action == 'setVisible' then
        SendNUIMessage({
            action = action,
            show = data
        })
    else
        SendNUIMessage({
            action = action,
            data = data
        })
    end
end

local function toggleScoreboard(show)
    if show == display then return end
    display = show
    
    SetNuiFocus(show, show)
    
    if show then
        local data = lib.callback.await('peak_scoreboard:server:getData', false)

        sendNuiMessage('setVisible', true)
        sendNuiMessage('updateData', data)
    else
        sendNuiMessage('setVisible', false)
    end
end

RegisterNUICallback('hideFrame', function()
    display = false
    SetNuiFocus(false, false)
end)

lib.addKeybind({
    name = 'scoreboard',
    description = 'Open Scoreboard',
    defaultKey = config.defaultKey,
    onPressed = function()
        print('test')
        toggleScoreboard(not display)
    end,
})

AddEventHandler('onResourceStop', function(resourceName)
    if resourceName ~= cache.resource then return end
    
    display = false
    SetNuiFocus(false, false)
end)
