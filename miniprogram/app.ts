App({
  globalData: {
    // mock: the page reads fixtures that mirror GET /api/mini/events/{id}
    // live: the page calls the endpoint through wx.request
    apiMode: "mock",
    baseUrl: "https://api.example.com",
  },
});
