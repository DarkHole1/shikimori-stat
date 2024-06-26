import fs from "fs";
import Koa from "koa";
import KoaRouter from "koa-router";
import canvas from "canvas";
import { hexToRgb, rgbToHex, gradient } from "./utils/color";
import getHistory from "./utils/getHistory";
import Cache from "./models/cache";

const monthNames = [
  "Янв",
  "Фев",
  "Март",
  "Апр",
  "Май",
  "Июнь",
  "Июль",
  "Авг",
  "Сент",
  "Окт",
  "Нояб",
  "Дек"
];

const app = new Koa();
const router = new KoaRouter();
canvas.registerFont("./fonts/roboto.ttf", { family: "Roboto" });

try {
  fs.mkdirSync("./cache");
} catch (error) {
  console.log(`Дириктория cache уже есть`);
}

Cache.clean();

setInterval(() => {
  try {
    Cache.clean();
  } catch (error) {
    console.log(error.message);
  }
}, 3 * 60 * 1000);

router.get(["/stat", "/stat.:type"], async ctx => {
  const startTime = new Date();

  const type = ctx.params.type ? ctx.params.type : "png";

  ctx.response.status = 200;
  if (type === "png") {
    ctx.type = "image/png";
  } else if (type === "svg") {
    ctx.type = "image/svg+xml";
  }
  const dates = {};

  const userId = parseInt(ctx.query.user.toString());
  const history = await getHistory(userId, true);
  const filename = await Cache.search(
    userId,
    type,
    new Date(history[0].created_at),
    {
      min: ctx.query.mincolor.toString(),
      max: ctx.query.maxcolor.toString(),
      blank: ctx.query.blankcolor.toString(),
      text: ctx.query.textcolor.toString()
    }
  );

  let loadedFromCache = false;
  if (filename) {
    try {
      await fs.promises.access(
        `./cache/${filename}.${type}`,
        fs.constants.F_OK
      );
      ctx.body = fs.createReadStream(`./cache/${filename}.${type}`);
      console.log(
        `user: ${ctx.query.user} from cache time: ${
          new Date().getTime() - startTime.getTime()
        }`
      );
      loadedFromCache = true;
    } catch (error) {
      Cache.deleteOne({ file: filename });
      console.log(`file not found - ${filename}`);
    }
  }
  if (!loadedFromCache) {
    const minColor = hexToRgb(ctx.query.mincolor.toString());
    const maxColor = hexToRgb(ctx.query.maxcolor.toString());
    const blankColor = hexToRgb(ctx.query.blankcolor.toString());
    const textColor = hexToRgb(ctx.query.textcolor.toString());

    history.push(...(await getHistory(userId, false)));

    for (const e of history) {
      const date = new Date(e.created_at);
      date.setHours(0);
      date.setMinutes(0);
      date.setSeconds(0);
      date.setMilliseconds(0);
      if (e.description.search(/просмо/i) !== -1) {
        let count = 1;
        if (e.description.search(/эпизода|эпизодов/i) !== -1) {
          const match = e.description.match(/\d+/);
          [count] = match;
        } else if (e.description.search(/эпизоды/i) !== -1) {
          count = e.description.match(/\d+/g).length;
        }
        if (dates[date.toISOString()]) {
          dates[date.toISOString()] = dates[date.toISOString()] + count;
        } else {
          dates[date.toISOString()] = count;
        }
      }
    }

    let max = 0;
    let summ = 0;
    let length = 0;
    for (const key in dates) {
      if (Object.prototype.hasOwnProperty.call(dates, key)) {
        const e = dates[key];
        if (e > max) {
          max = e;
        }
        summ += e;
        length += 1;
      }
    }
    const mid = summ / length;
    const maxPers = mid * 2 > max ? max : mid * 2;

    const img = canvas.createCanvas(
      875,
      128,
      type === "svg" ? "svg" : undefined
    );

    const imgc = img.getContext("2d");

    const offsetX = 20;
    const offsetY = 16;

    imgc.font = "12zpt Roboto";
    imgc.fillStyle = `rgba(${textColor.red},${textColor.green},${textColor.blue}, 1)`;
    imgc.fillText("ПН", 0, 28);
    imgc.fillText("ЧТ", 0, 76);
    imgc.fillText("СБ", 0, 124);

    let lastMon = -1;
    for (let week = 51; week >= 0; week -= 1) {
      const mount = new Date();
      mount.setDate(mount.getDate() - week * 7);
      if (mount.getMonth() !== lastMon || lastMon === -1) {
        lastMon = mount.getMonth();
        imgc.fillStyle = `rgba(${textColor.red},${textColor.green},${textColor.blue}, 1)`;
        imgc.fillText(`${monthNames[lastMon]}`, 816 - week * 16 + offsetX, 10);
      }

      for (let day = 0; day < 7; day += 1) {
        const date = new Date();
        date.setDate(date.getDate() - (week * 7 + (date.getDay() - day) - 1));
        date.setHours(0);
        date.setMinutes(0);
        date.setSeconds(0);
        date.setMilliseconds(0);
        // console.log(date, week, day);
        const e = dates[date.toISOString()];
        if (e) {
          const pers = e / maxPers;
          imgc.fillStyle = rgbToHex(
            gradient(minColor, maxColor, pers > 1 ? 1 : pers)
          );
        } else {
          imgc.fillStyle = rgbToHex(blankColor);
        }
        if (date <= new Date()) {
          imgc.fillRect(816 - week * 16 + offsetX, day * 16 + offsetY, 12, 12);
        }
      }
    }

    const ct = new Cache({
      user: ctx.query.user,
      type,
      latest: new Date(history[0].created_at),
      color: {
        min: ctx.query.mincolor,
        max: ctx.query.maxcolor,
        blank: ctx.query.blankcolor,
        text: ctx.query.textcolor
      }
    });

    if (type === "png") {
      const stream = img.createPNGStream();
      ctx.body = stream;
      stream.pipe(fs.createWriteStream(`./cache/${ct.file}.${type}`));
    } else if (type === "svg") {
      const buffer = img.toBuffer();
      ctx.body = buffer;
      fs.writeFile(`./cache/${ct.file}.${type}`, buffer, err => {
        if (err) console.log(err);
      });
    }

    ct.save();

    console.log(
      `user: ${ctx.query.user} history: ${
        history.length
      } dates: ${length} time: ${new Date().getTime() - startTime.getTime()}`
    );
  }
});

app.use(async (ctx, next) => {
  for (const key of Object.keys(ctx.query)) {
    ctx.query[key.replace("amp;", "")] = ctx.query[key];
  }
  console.log(ctx.path);
  await next();
});

app.use(router.routes());

app.listen(8080, () => console.log("started"));
