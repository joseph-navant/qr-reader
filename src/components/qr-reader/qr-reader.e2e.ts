import { newE2EPage } from '@stencil/core/testing';

describe('qr-reader', () => {
  it('renders', async () => {
    const page = await newE2EPage();

    await page.setContent('<qr-reader></qr-reader>');
    const element = await page.find('qr-reader');
    expect(element).toHaveClass('hydrated');
  });
});
