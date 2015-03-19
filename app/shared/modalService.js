app.factory('ModalService', function () {
    function Modal(options)
    {
        this.opts = this.merge({
            title : "Atraci",
            tpl : "",
            footer : ""
        }, options);

        this.init();
    }

    Modal.prototype.init = function () {
        var self = this;

        self.elem = document.getElementById("modal");

        var Elements = {
            HEADER : self.elem.querySelector(".header"),
            FOOTER : self.elem.querySelector(".footer"),
            CONTENT : self.elem.querySelector(".content")
        };

        self.elem.querySelector(".fa-close").addEventListener("click", function () {
            self.hide();
        });

        Elements.HEADER.innerHTML = self.opts.title;
        Elements.CONTENT.innerHTML = self.opts.tpl;
        self.opts.footer ? Elements.FOOTER.innerHTML = self.opts.footer : Elements.FOOTER.style.display = "none";

        move('#modal')
            .set('opacity', 0)
            .end();

        move('#modal .modalWrapper')
            .scale(0)
            .end();
    };

    Modal.prototype.constructor = Modal;

    Modal.prototype.show = function () {
        move('#modal')
            .set('display', 'block')
            .set('opacity', 1)
            .end();

        move('#modal .modalWrapper')
            .scale(1)
            .end();
    };

    Modal.prototype.hide = function () {
        move('#modal')
            .set('display', 'none')
            .end();

        move('#modal .modalWrapper')
            .scale(0)
            .end();
    };

    Modal.prototype.merge = function (obj1, obj2) {
        var obj3 = {};
        for (var Attribute1 in obj1) { obj3[Attribute1] = obj1[Attribute1]; }
        for (var Attribute2 in obj2) { obj3[Attribute2] = obj2[Attribute2]; }
        return obj3;
    };

    return Modal;
});