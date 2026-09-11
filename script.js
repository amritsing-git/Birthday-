// @ts-check

const arrow = document.getElementById("arrow");
const aimArea = document.getElementById("archeryScreen");
const heartTarget = document.getElementById("heartTarget");
const aimLine = document.getElementById("aimLine");
const instruction = document.getElementById("instruction");
const hitEffect = document.getElementById("hitEffect");
const birthdayScene = document.getElementById("birthdayScene");

let aiming = false;
let shooting = false;
let aimAngle = 0;


/* =================================
   GET CENTER
================================= */

/**
 * @param {HTMLElement} element
 * @returns {{x: number, y: number}}
 */
function getCenter(element) {

    const rect = element.getBoundingClientRect();

    return {
        x: rect.left + rect.width / 2,
        y: rect.top + rect.height / 2
    };
}


/* =================================
   RESET ARROW
================================= */

function resetArrow() {

    arrow.style.transition = "none";
    arrow.style.left = "23%";
    arrow.style.top = "70%";
    arrow.style.opacity = "1";

    arrow.style.transform =
        "translate(-10px, -50%) rotate(180deg)";
}


/* =================================
   UPDATE AIM
================================= */

/**
 * @param {number} x
 * @param {number} y
 */
function updateAim(x, y) {

    if (shooting) {
        return;
    }

    const start = getCenter(arrow);

    const dx = x - start.x;
    const dy = y - start.y;

    if (Math.abs(dx) < 2 && Math.abs(dy) < 2) {
        return;
    }

    aimAngle =
        Math.atan2(dy, dx) * 180 / Math.PI;

    const visualAngle =
        aimAngle + 180;

    arrow.style.transform =
        "translate(-10px, -50%) rotate(" +
        visualAngle +
        "deg)";


    const distance =
        Math.sqrt(
            dx * dx +
            dy * dy
        );

    aimLine.style.left =
        start.x + "px";

    aimLine.style.top =
        start.y + "px";

    aimLine.style.width =
        Math.min(distance, 500) + "px";

    aimLine.style.transform =
        "rotate(" +
        aimAngle +
        "deg)";

    aimLine.style.opacity = "0.45";
}


/* =================================
   POINTER DOWN
================================= */

aimArea.addEventListener(
    "pointerdown",
    function(event) {

        if (shooting) {
            return;
        }

        aiming = true;

        aimAtPointer(event);

        instruction.querySelector(
            ".instructionTitle"
        ).textContent =
            "🎯 Aim at the heart";

        instruction.querySelector(
            ".instructionText"
        ).textContent =
            "Release to shoot";
    }
);


/* =================================
   POINTER MOVE
================================= */

aimArea.addEventListener(
    "pointermove",
    function(event) {

        if (!aiming || shooting) {
            return;
        }

        aimAtPointer(event);
    }
);


/* =================================
   POINTER UP
================================= */

aimArea.addEventListener(
    "pointerup",
    function() {

        if (!aiming || shooting) {
            return;
        }

        aiming = false;

        aimLine.style.opacity = "0";

        shootArrow();
    }
);


/* =================================
   POINTER CANCEL
================================= */

aimArea.addEventListener(
    "pointercancel",
    function() {

        aiming = false;

        aimLine.style.opacity = "0";
    }
);


/* =================================
   POINTER AIM
================================= */

/**
 * @param {PointerEvent} event
 */
function aimAtPointer(event) {

    updateAim(
        event.clientX,
        event.clientY
    );
}


/* =================================
   SHOOT
================================= */

function shootArrow() {

    shooting = true;

    instruction.style.opacity = "0";

    const shotAngle =
        aimAngle;

    const visualAngle =
        shotAngle + 180;

    const hit =
        checkHit(shotAngle);


    arrow.style.transition =
        "transform 1s cubic-bezier(.15,.75,.2,1)";

    arrow.style.transform =
        "translate(-10px, -50%) rotate(" +
        visualAngle +
        "deg) translateX(1000px)";


    setTimeout(
        function() {

            if (hit) {
                heartHit();
            } else {
                missShot();
            }

        },
        900
    );
}


/* =================================
   CHECK HIT
================================= */

/**
 * @param {number} angle
 * @returns {boolean}
 */
function checkHit(angle) {

    const arrowPosition =
        getCenter(arrow);

    const heartPosition =
        getCenter(heartTarget);

    const radians =
        angle * Math.PI / 180;

    const directionX =
        Math.cos(radians);

    const directionY =
        Math.sin(radians);

    const targetX =
        heartPosition.x -
        arrowPosition.x;

    const targetY =
        heartPosition.y -
        arrowPosition.y;

    const projection =
        targetX * directionX +
        targetY * directionY;

    if (projection < 0) {
        return false;
    }

    const closestX =
        directionX * projection;

    const closestY =
        directionY * projection;

    const differenceX =
        targetX - closestX;

    const differenceY =
        targetY - closestY;

    const distance =
        Math.sqrt(
            differenceX * differenceX +
            differenceY * differenceY
        );

    const hitRadius =
        Math.max(
            heartTarget.offsetWidth * 0.52,
            38
        );

    return distance <= hitRadius;
}


/* =================================
   HEART HIT
================================= */

function heartHit() {

    const position =
        getCenter(heartTarget);

    hitEffect.style.left =
        position.x + "px";

    hitEffect.style.top =
        position.y + "px";

    hitEffect.classList.remove(
        "active"
    );

    void hitEffect.offsetWidth;

    hitEffect.classList.add(
        "active"
    );


    heartTarget.style.transition =
        "transform .25s ease";

    heartTarget.style.transform =
        "translate(-50%, -50%) scale(1.35)";


    setTimeout(
        function() {

            heartTarget.style.opacity =
                "0";

        },
        250
    );


    setTimeout(
        function() {

            birthdayScene.classList.add(
                "show"
            );

            aimArea.style.opacity =
                "0";

        },
        650
    );
}


/* =================================
   MISSED
================================= */

function missShot() {

    instruction.style.opacity =
        "1";

    instruction.querySelector(
        ".instructionTitle"
    ).textContent =
        "💨 Missed!";

    instruction.querySelector(
        ".instructionText"
    ).textContent =
        "Aim at the heart and try again";


    setTimeout(
        function() {

            resetArrow();

            shooting = false;

            instruction.querySelector(
                ".instructionTitle"
            ).textContent =
                "🎯 Aim at the heart";

            instruction.querySelector(
                ".instructionText"
            ).textContent =
                "Drag anywhere to aim • Release to shoot";

        },
        1000
    );
}


/* =================================
   INITIAL
================================= */

resetArrow();


/* =================================
   PREVENT CONTEXT MENU
================================= */

document.addEventListener(
    "contextmenu",
    function(event) {

        event.preventDefault();
    }
);