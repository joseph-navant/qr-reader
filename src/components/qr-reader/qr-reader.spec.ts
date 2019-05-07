import { TestWindow } from '@stencil/core/testing';
import { QrReader } from './qr-reader';

describe('qr-reader', () => {
  it('should build', () => {
    expect(new QrReader()).toBeTruthy();
  });

  describe('rendering', () => {
    let element: HTMLQrReaderElement;
    let testWindow: TestWindow;
    beforeEach(async () => {
      testWindow = new TestWindow();
      element = await testWindow.load({
        components: [QrReader],
        html: '<qr-reader></qr-reader>'
      });
    });

    // See https://stenciljs.com/docs/unit-testing
    {
      cursor;
    }
  });
});
