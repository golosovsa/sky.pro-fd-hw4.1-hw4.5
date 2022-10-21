import "/style/style.scss";

import { timeout } from "./common/timeout";
import { DialogDifficulty } from "./widgets/dialog-difficulty";
import { CardTable } from "./widgets/card-table";
import { Timer } from "./widgets/timer";
import { PageDifficulty } from "./pages/page-difficulty";
import { PageGame } from "./pages/page-game";
import { PageResults } from "./pages/page-results";

document.addEventListener("DOMContentLoaded", () => {

    (document as any).app = {};

    let app = (document as any).app as TApp;

    app = {
        settings: {
            difficulty: localStorage.getItem("difficulty") || "2",
            timeSpentPlaying: Number(
                localStorage.getItem("timeSpentPlaying") || "0"
            ),
            currentGameStartTime: new Date().getTime(),
            currentPage: undefined,
            lastGameStatus: undefined,
            lastGameTime: undefined,
        },
        container: document.querySelector(".page") as HTMLElement,
        blocks: {
            dialogDifficulty: new DialogDifficulty(),
            cardTable: new CardTable(),
            timer: new Timer(),
        },
        pages: {},
        run: async function() {}
    };

    app.pages = {
        pageSelectDifficulty: new PageDifficulty(
            app.container,
            app.blocks.dialogDifficulty as DialogDifficulty
        ),
        pageGame: new PageGame(
            app.container,
            app.blocks.cardTable as CardTable,
            app.blocks.timer as Timer
        ),
        pageResults: new PageResults(app.container),
    };

    app.settings.currentPage = app.pages.pageSelectDifficulty;

    app.run = async function(): Promise<void> {
        const pages = Object.values(app.pages);
        const _nextPage = () => {
            const pageIndex =
                (pages.indexOf(app.settings.currentPage) + 1) %
                pages.length;
            
            return pages[pageIndex];
        };

        if (!app.settings.currentPage) {
            return;
        }

        // eslint-disable-next-line no-constant-condition
        while (true) {
            if (!app.settings.currentPage) {
                throw Error("Error");
            }
            const action = await (app.settings.currentPage as any).run(
                app.settings
            );
            if (action === "next") {
                app.settings.currentPage = _nextPage();
            }
            await timeout(300);
        }
    };

    app.run();
});

window.addEventListener("beforeunload", () => {
    let app = (document as any).app as TApp;
    localStorage.setItem("difficulty", app.settings.difficulty);
    const totalTime =
        app.settings.timeSpentPlaying +
        (new Date().getTime() - app.settings.currentGameStartTime) /
            1000;
    localStorage.setItem("timeSpentPlaying", String(totalTime));
});
