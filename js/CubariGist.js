import fetch from "node-fetch";
import { makeFileSafe } from "./utility.js";
import DownloadQueue from "./DownloadQueue.js";
import { createSpinner } from "nanospinner";
export default class Cubari {
    /**
     *
     * @param link cubari gist link
     */
    static download(link, start, count = 0) {
        const spinner = createSpinner("Getting Data...").start();
        fetch(link)
            .then((e) => e.json())
            .then((e) => {
            const filtered = [];
            if (start < 0) {
                const tempData = [];
                for (const key in e.chapters) {
                    const obj = e.chapters[key];
                    tempData.push({
                        name: makeFileSafe(obj.title),
                        pages: obj.groups[Object.keys(obj.groups)[0]],
                        number: parseFloat(key),
                    });
                }
                filtered.push(...tempData
                    .sort((a, b) => (a.number < b.number ? -1 : 1))
                    .splice(start)
                    .map((e) => ({ name: e.name, pages: e.pages })));
            }
            else
                for (const key in e.chapters) {
                    if (parseFloat(key) >= start && parseFloat(key) <= start + count) {
                        const obj = e.chapters[key];
                        filtered.push({
                            name: makeFileSafe(obj.title),
                            pages: obj.groups[Object.keys(obj.groups)[0]],
                        });
                    }
                }
            // fs.writeFileSync("./test.json",JSON.stringify(filtered,null,"\t"));
            if (filtered.length > 0) {
                spinner.success();
                const queue = new DownloadQueue(e.title, filtered);
                queue.start();
            }
            // filtered.forEach((e) => {
            //     const savePath = path.join(saveDir, e.name);
            //     e.pages.forEach((e, i) => saveImage(e, i, savePath));
            // });
        })
            .catch((e) => spinner.error({ text: e }));
    }
}