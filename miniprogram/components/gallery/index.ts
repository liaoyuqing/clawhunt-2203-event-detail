Component({
  properties: {
    images: { type: Array, value: [] },
  },
  methods: {
    onPreview(this: any, e: any) {
      const index = Number(e.currentTarget.dataset.index || 0);
      const urls = this.data.images as string[];
      wx.previewImage({ current: urls[index], urls });
    },
  },
});
