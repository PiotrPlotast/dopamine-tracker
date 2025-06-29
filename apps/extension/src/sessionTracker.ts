export class SessionTracker {
  clickCount = 0;
  maxScrollPercent = 0;
  sessionStart = Date.now();
  url: string;

  constructor(url: string) {
    this.url = url;
  }

  recordClick() {
    this.clickCount += 1;
  }

  recordScroll(scrollY: number, innerHeight: number, scrollHeight: number) {
    const scrolled = scrollY + innerHeight;
    const percent = (scrolled / scrollHeight) * 100;
    this.maxScrollPercent = Math.min(
      100,
      Math.max(this.maxScrollPercent, percent)
    );
  }

  getActivity() {
    return {
      url: this.url,
      duration: Math.floor((Date.now() - this.sessionStart) / 1000),
      clicks: this.clickCount,
      scrolls: Math.round(this.maxScrollPercent),
      hour_of_day: new Date().getHours(),
      date: new Date(),
      timestamp: new Date(),
    };
  }
}
