// Le paquet ne publie pas de types.
declare module '@private-captcha/private-captcha-js-core' {
  export class CaptchaWidget {
    constructor(element: HTMLElement, options?: Record<string, unknown>);
  }
}
