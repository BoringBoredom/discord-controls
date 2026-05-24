const commands = {
  "toggle-mute": { label: "Mute", lastCommandAt: 0 },
  "toggle-deafen": { label: "Deafen", lastCommandAt: 0 },
};

function activateDiscordControl(label) {
  const button = document.querySelector(`button[aria-label="${label}"]`);
  if (!button) {
    return false;
  }

  button.click();
  return true;
}

async function handleCommand(command) {
  const commandState = commands[command];
  if (!commandState) {
    return;
  }

  const now = Date.now();
  if (now - commandState.lastCommandAt < 250) {
    return;
  }

  commandState.lastCommandAt = now;

  const tabs = await chrome.tabs.query({ url: "https://discord.com/*" });
  let tab;
  for (const candidate of tabs) {
    if (!tab || (candidate.lastAccessed || 0) > (tab.lastAccessed || 0)) {
      tab = candidate;
    }
  }
  if (typeof tab?.id !== "number") {
    return;
  }

  await chrome.scripting.executeScript({
    target: { tabId: tab.id },
    func: activateDiscordControl,
    args: [commandState.label],
  });
}

chrome.commands.onCommand.addListener((command) =>
  handleCommand(command).catch((error) => {
    console.error("Failed to toggle Discord control:", error);
  }),
);
