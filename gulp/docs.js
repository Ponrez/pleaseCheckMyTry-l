const gulp = require("gulp");

// html
const fileInclude = require("gulp-file-include");
// const htmlclean = require("gulp-htmlclean");
// const webpHTML = require("gulp-webp-html");
const webpHTML = require("gulp-webp-html-nosvg");

// sass
const sass = require("gulp-sass")(require("sass"));
const sassGlob = require("gulp-sass-glob");
const autoprefixer = require("gulp-autoprefixer");
// const csso = require("gulp-csso");
const webpCss = require("gulp-webp-css");

const server = require("gulp-server-livereload");
const clean = require("gulp-clean");
const fs = require("fs");
const plumber = require("gulp-plumber");
const notify = require("gulp-notify");
const webpack = require("webpack-stream");
const babel = require("gulp-babel");

// Img
const imagemin = require("gulp-imagemin");
const imageminWebp = require("imagemin-webp");
const webp = require("gulp-webp");

const changed = require("gulp-changed");
const replace = require("gulp-replace");
const rename = require("gulp-rename");

gulp.task("clean:docs", function (done) {
  if (fs.existsSync("./docs/")) {
    return gulp.src("./docs/", { read: false }).pipe(clean({ force: true }));
  }
  done();
});

const fileIncludeSetting = {
  prefix: "@@",
  basepath: "@file",
};

const plumberNotify = (title) => {
  return {
    errorHandler: notify.onError({
      title: title,
      message: "Error <%= error.message %>",
      sound: false,
    }),
  };
};

gulp.task("libs:docs", function () {
  return gulp
    .src("./src/libs/**/*", { encoding: false })
    .pipe(changed("./docs/libs/"))
    .pipe(gulp.dest("./docs/libs/"));
});

gulp.task("html:docs", function () {
  return (
    gulp
      .src(["./src/html/**/*.html", "!./src/html/blocks/*.html"])
      .pipe(changed("./docs/"))
      .pipe(plumber(plumberNotify("HTML")))
      .pipe(fileInclude(fileIncludeSetting))
      .pipe(
        replace(
          /(?<=src=|href=|srcset=)(['"])(\.(\.)?\/)*(img|images|fonts|css|scss|sass|js|files|audio|video)(\/[^\/'"]+(\/))?([^'"]*)\1/gi,
          "$1./$4$5$7$1"
        )
      )
      .pipe(webpHTML())
      // .pipe(htmlclean())
      .pipe(gulp.dest("./docs/"))
  );
});

// gulp.task("html:docs", function () {
//   return gulp
//     .src("./src/html/**/*.html")
//     .pipe(gulp.dest("./docs/"));
// });

gulp.task("sass:docs", function () {
  return (
    gulp
      .src("./src/scss/*.scss")
      .pipe(changed("./docs/css/"))
      .pipe(plumber(plumberNotify("SASS")))
      .pipe(sassGlob())
      .pipe(sass())
      .pipe(autoprefixer())
      .pipe(replace(/(?<=url\(['"]?)(\.\.\/)+img\//g, "../img/"))
      // .pipe(csso())
      .pipe(gulp.dest("./docs/css/"))
  );
});

gulp.task("images:docs", function () {
  return (
    gulp
      // .src("./src/img/**/*", { encoding: false })
      .src(["./src/img/**/*", "!./src/img/svgicons/**/*"], { encoding: false })
      .pipe(changed("./docs/img"))
      .pipe(
        imagemin([
          imageminWebp({
            quality: 85,
          }),
        ])
      )
      .pipe(rename({ extname: ".webp" }))
      .pipe(gulp.dest("./docs/img/"))
      .pipe(gulp.src("./src/img/**/*", { encoding: false }))
      .pipe(changed("./docs/img"))
      .pipe(
        imagemin(
          [
            imagemin.gifsicle({ interlaced: true }),
            imagemin.mozjpeg({ quality: 85, progressive: true }),
            imagemin.optipng({ optimizationLevel: 5 }),
          ],
          { verbose: true }
        )
      )
      .pipe(gulp.dest("./docs/img/"))
  );
});

gulp.task("fonts:docs", function () {
  return gulp
    .src("./src/fonts/**/*")
    .pipe(changed("./docs/fonts/"))
    .pipe(gulp.dest("./docs/fonts/"));
});

// gulp.task("files:docs", function () {
//   return gulp
//     .src("./src/files/**/*")
//     .pipe(changed("./docs/files/"))
//     .pipe(gulp.dest("./docs/files/"));
// });

gulp.task("js:docs", function () {
  return gulp
    .src("./src/js/*.js")
    // .pipe(changed("./docs/js/"))
    .pipe(plumber(plumberNotify("JS")))
    // .pipe(babel())
    .pipe(webpack(require("../webpack.config.js")))
    .pipe(gulp.dest("./docs/js/"));
});

gulp.task("server:docs", function () {
  return gulp.src("./docs/").pipe(
    server({
      livereload: true,
      open: true,
    })
  );
});

// gulp.task("images", function () {
//   return gulp
//     .src("./src/img/**/*", { encoding: false })
//     .pipe(gulp.dest("./docs/img/"));
// });
