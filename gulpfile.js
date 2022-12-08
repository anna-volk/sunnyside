const gulp = require("gulp");
const del = require("del");
const fileinclude = require("gulp-file-include");
const replace = require("gulp-replace"); //@img
const browserSync = require("browser-sync");
const sass = require("gulp-sass")(require("sass"));
const rename = require("gulp-rename"); //add suffix
const htmlmin = require("gulp-htmlmin");
const autoprefixer = require("gulp-autoprefixer");
const webpcss = require("gulp-webpcss");
const groupMedia = require("gulp-group-css-media-queries");
const cleanCSS = require("gulp-clean-css");
const babel = require("gulp-babel");
const uglify = require("gulp-uglify");
const imagemin = require("gulp-imagemin");
const gulpWebp = require("gulp-webp");
const newer = require("gulp-newer");
const size = require("gulp-size");
const versionNumber = require("gulp-version-number"); //

// PATHS:

const paths = {
  html: {
    src: "src/*.html",
    dest: "dist",
  },
  styles: {
    src: "src/styles/styles.scss",
    dest: "dist/css/",
  },
  scripts: {
    src: "src/scripts/**/*.js",
    dest: "dist/scripts/",
  },
  images: {
    src: "src/img/**/*.{jpg,jpeg,png}",
    dest: "dist/img",
  },
  imgsvg: {
    src: "src/img/**/*.{svg, gif, ico}",
    dest: "dist/img",
  },
  fonts: {
    src: "src/fonts/**/*.*",
    dest: "dist/fonts",
  },
};

//DELETE DIST (del)
function clean() {
  return del(["dist/*", "!dist/img"]);
}
//DELETE DIST IMAGES (del)
function cleanImg() {
  return del("dist/img");
}
// FONTS
function fonts() {
  return gulp.src(paths.fonts.src).pipe(gulp.dest(paths.fonts.dest));
}

// HTML
function html() {
  return gulp
    .src(paths.html.src)
    .pipe(fileinclude())
    .pipe(replace(/@img\//g, "img/"))
    .pipe(
      versionNumber({
        value: "%DT%",
        append: {
          key: "_v",
          cover: 0,
          to: ["css", "js"],
        },
        output: {
          file: "gulp/version.json",
        },
      })
    )
    .pipe(gulp.dest("dist/not-minified-src-files/"))
    .pipe(htmlmin({ collapseWhitespace: true, removeComments: true }))
    .pipe(gulp.dest(paths.html.dest))
    .pipe(browserSync.reload({ stream: true }));
}

// STYLES
function styles() {
  return (
    gulp
      .src(paths.styles.src)
      .pipe(
        sass({
          outputStyle: "expanded",
        })
      )
      .pipe(replace(/@img\//g, "../img/"))
      .pipe(groupMedia())
      // .pipe(
      //   webpcss({
      //     webpClass: ".webp",
      //     noWebpClass: ".no-webp",
      //   })
      // )
      .pipe(
        autoprefixer({
          grid: true,
          cascade: true,
          overrideBrowserslist: ["last 3 versions", "not dead", "not ie <= 12"],
        })
      )
      .pipe(gulp.dest("dist/not-minified-src-files/"))
      .pipe(cleanCSS())
      .pipe(
        rename({
          extname: ".min.css",
        })
      )
      .pipe(gulp.dest(paths.styles.dest))
      .pipe(browserSync.stream())
  );
}

// SCRIPTS
function scripts() {
  return gulp
    .src(paths.scripts.src)
    .pipe(gulp.dest("dist/not-minified-src-files/"))
    .pipe(
      babel({
        presets: ["@babel/env"],
      })
    )
    .pipe(uglify())
    .pipe(
      rename({
        extname: ".min.js",
      })
    )
    .pipe(gulp.dest(paths.scripts.dest))
    .pipe(browserSync.stream());
}

// IMAGES
function img() {
  return (
    gulp
      // WEBP
      .src(paths.images.src)
      // .pipe(newer(paths.images.dest))
      // .pipe(gulpWebp())
      // .pipe(gulpWebp({ lossless: true }))
      // .pipe(gulpWebp({quality: 50})) // 0 to 100
      // .pipe(
      //   size({
      //     showFiles: true,
      //   })
      // )
      // .pipe(gulp.dest(paths.images.dest))
      // JPG, PNG
      .pipe(gulp.src(paths.images.src))
      .pipe(newer(paths.images.dest))
      .pipe(
        imagemin({
          progressive: true,
          svgoPlugins: [{ removeViewBox: false }],
          interlaced: true,
          optimizationLevel: 3, // 0 to 7
        })
      )
      .pipe(
        size({
          showFiles: true,
        })
      )
      .pipe(gulp.dest(paths.images.dest))
      .pipe(gulp.src(paths.imgsvg.src))
      .pipe(gulp.dest(paths.images.dest))
  );
}

//WATCH
function watch() {
  browserSync.init({
    server: {
      baseDir: "./dist/",
    },
  });
  gulp.watch("src/fonts/*.*", fonts);
  gulp.watch("src/**/*.html", html);
  gulp.watch("src/**/*.scss", styles);
  gulp.watch("src/**/*.js", scripts);
  gulp.watch("src/img/**/*.{jpg,jpeg,png,svg,gif,ico,webp}", img);
}

// EXPORTS
exports.clean = clean; //del
exports.fonts = fonts;
exports.cleanImg = cleanImg;
exports.html = html;
exports.styles = styles;
exports.scripts = scripts;
exports.img = img;
exports.watch = watch;

// BUILD
exports.default = gulp.series(
  clean,
  gulp.parallel(html, styles, scripts, img, fonts),
  watch
);
