let fg = {
    getCurrentTab: async function () {
        let queryOptions = {active: true, lastFocusedWindow: true};
        let [tab] = await chrome.tabs.query(queryOptions);
        return tab;
    },
    getSpecificTabs: async function (queryOptions) {
        let tabs = await chrome.tabs.query(queryOptions);
        return tabs;
    },
    actionTabs: async function (command) {
        try {
            const currentWindow = await chrome.windows.getCurrent();
            if (command === "all-tabs") {
                return await fg.getSpecificTabs({windowId: currentWindow.id});
            }
            const currentTab = await fg.getCurrentTab();
            const currentTabIndex = currentTab.index;
            const specificTabs = await fg.getSpecificTabs({active: false, pinned: false, windowId: currentWindow.id});
            // const tabIds = new Array(specificTabs.length);

            let reTabIds = null;

            if (command === 'other-tabs') {
                reTabIds = specificTabs.map((tab) => tab.id);
            } else if (command === 'left-tabs') {
                reTabIds = specificTabs.filter((tab) => tab.index < currentTabIndex).map((tab) => tab.id);
            } else if (command === 'right-tabs') {
                reTabIds = specificTabs.filter((tab) => tab.index > currentTabIndex).map((tab) => tab.id);
            } else if (command === 'left-tab') {
                reTabIds = specificTabs.slice(currentTabIndex - 1, currentTabIndex).map(tab => tab.id);
            } else if (command === 'right-tab') {
                reTabIds = specificTabs.slice(currentTabIndex, currentTabIndex + 1).map(tab => tab.id);
            }

            return reTabIds;
        } catch (e) {
            console.log(e)
            return [];
        }
    },
    getMessageData: function (content, action) {
        return {
            action: action,
            content: content
        };
    }

};
export {fg}