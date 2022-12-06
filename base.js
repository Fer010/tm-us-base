// ==UserScript==
// @name           FBase Lib
// @description    Base library
// @version        0.0.1
// ==/UserScript==
const FOUR_MINUTES = 4 * 60 * 1000;
const wait = ms => new Promise(resolve => setTimeout(resolve, ms || 3000));

Element.prototype.isVisible = function() {
    return !!(this.offsetWidth||this.offsetHeight||this.getClientRects().length);
};
Element.prototype.isUserFriendly = function(selector) {
    let e = selector ? this.querySelector(selector) : this;
    return e && e.isVisible()  ? e : null;
};
Document.prototype.isUserFriendly = Element.prototype.isUserFriendly;

class CrawlerWidget {
    constructor(params) {
        if (!params || !params.selector) {
            throw new Error('CrawlerWidget requires a selector parameter');
        }
        this.context = this.context || document;
        Object.assign(this, params);
    }

    get isUserFriendly() {
        this.element = this.context.isUserFriendly(this.selector);
        return this.element;
    }
}

class CaptchaWidget extends CrawlerWidget {
    constructor(params) {
        super(params);
    }

    solve() { return true; }

    async isSolved() { return false; }
}

class HCaptchaWidget extends CaptchaWidget {
    constructor(params) {
        let defaultParams = {
            selector: '.h-captcha > iframe',
            waitMs: [1000, 5000],
            timeoutMs: FOUR_MINUTES
        };
        for (let p in params) {
            defaultParams[p] = params[p];
        }
        super(defaultParams);
    }

    async isSolved() {
        return wait().then( () => {
            if (this.isUserFriendly && this.element.hasAttribute('data-hcaptcha-response') && this.element.getAttribute('data-hcaptcha-response').length > 0) {
                return Promise.resolve(true);
            }
            return this.isSolved();
        });
    }
}