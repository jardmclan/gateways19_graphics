import { Component, OnInit, Renderer2, ViewChild } from '@angular/core';
import * as chroma_ from 'chroma-js';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {

  @ViewChild("wrapper") wrapper;

  title = 'app';
  chroma: any = chroma_ as any;

  grays = [];
  colors = [];
  r = [];
  g = [];
  b = [];


  constructor(private renderer: Renderer2) {  }
  

  ngOnInit() {
    this.colors = this.landCoverPalette();
    this.colors.forEach((color) => {
      let gray = this.chroma(color).luminance() * 255;
      this.grays.push(this.chroma(gray, gray, gray));
      this.r.push("rgb(" + color._rgb[0] + ", 0, 0)");
      this.g.push("rgb(0, " + color._rgb[1] + ", 0)");
      this.b.push("rgb(0, 0, " + color._rgb[2] + ")");
    });
    

    let w = 30;
    let h = 30;

    let grid = this.genGrid(w, h, 0, 0);

    //this.genGrid(10, 10, 150, 150);

    // this.genBBox(2, 3, 5, 2);

    // this.addEllipsis(100, 10, true);
    // this.addEllipsis(20, 100, false);

    let xmax = Number.NEGATIVE_INFINITY;
    let xmin = Number.POSITIVE_INFINITY;
    let ymax = Number.NEGATIVE_INFINITY;
    let ymin = Number.POSITIVE_INFINITY;

    let indices = [];
    let x, y;
    for(x = 0; x < w; x++) {
      for(y = 0; y < h; y++) {
        if(Math.pow(x - 9, 2) / 3 + Math.pow(y - 7, 2) < 20) {
          let val = y * w + x;
          indices.push(val);
          if(x > xmax) {
            xmax = x;
          }
          if(x < xmin) {
            xmin = x;
          }
          if(y > ymax) {
            ymax = y;
          }
          if(y < ymin) {
            ymin = y;
          }
        }
      }
    }

    for(x = 0; x < w; x++) {
      for(y = 0; y < h; y++) {
        if(Math.pow(x - 20, 2) + Math.pow(y - 20, 2) < 36) {
          let val = y * w + x;
          indices.push(val);
          if(x > xmax) {
            xmax = x;
          }
          if(x < xmin) {
            xmin = x;
          }
          if(y > ymax) {
            ymax = y;
          }
          if(y < ymin) {
            ymin = y;
          }
        }
      }
    }

    let xspan = xmax - xmin + 1;
    let yspan = ymax - ymin + 1;
    this.genBBox(xmin, ymin, xspan, yspan, 0, 0);

    let hl = [];
    let vl = [];

    let cellLimit = 5000 / 40;
    let whRatio = xspan / yspan;
    let maxCells = xspan * yspan;

    let divisions = {
      x: 1,
      y: 1
    };

    while(maxCells > cellLimit) {
      //split proportionally
      if(divisions.x / divisions.y < whRatio) {
        divisions.x++;
      }
      else {
        divisions.y++;
      }
      let subWidth = Math.ceil(xspan / divisions.x);
      let subHeight = Math.ceil(yspan / divisions.y);
      maxCells = subWidth * subHeight;
    }
    console.log(divisions);
    let subWidth = Math.ceil(xspan / divisions.x);
    let subHeight = Math.ceil(yspan / divisions.y);

    console.log(subWidth, subHeight, subWidth * subHeight);

    let i;
    for(i = subWidth; i < xspan; i += subWidth) {
      vl.push(i);
    }
    for(i = subHeight; i < yspan; i += subHeight) {
      hl.push(i);
    }

    this.createSubGrid(hl, vl, xspan, yspan, 0, 0, xmin, ymin);

    this.colorCells(indices, grid);

    let widths = [];
    let heights = [];

    let j;
    let wt = 0;
    let ht = 0;
    for(i = 1; i < divisions.x; i++) {
      widths.push(subWidth);
      wt += subWidth;
    }
    for(j = 1; j < divisions.y; j++) {
      heights.push(subHeight);
      ht += subHeight;
    }
    widths.push(xspan - wt);
    heights.push(yspan - ht);

    console.log(widths, heights);

    let offx = 0;
    let offy = 500;

    for(i = 0; i < widths.length; i++) {
      offy = 500;
      for(j = 0; j < heights.length; j++) {
        this.genGrid(widths[i], heights[j], offx, offy);
        offy += heights[j] * 9 + 20;
      }
      offx += widths[i] * 9 + 20;
    }
    
  }


  private genGrid(w: number, h: number, offsetW: number, offsetH: number) {
    let wrapper = this.wrapper.nativeElement;
    let children = [];
    
    let i;
    let j;
    for(i = 0; i < h; i++) {
      for(j = 0; j < w; j++) {
        let gridDiv = this.renderer.createElement("div");
        gridDiv.setAttribute("class", "grid-box");
        let posStyle = "left:" + (offsetW + j * 9) + "px; top:" + (offsetH + i * 9) + "px;";
        gridDiv.setAttribute("style", posStyle);
        this.renderer.appendChild(wrapper, gridDiv);
        children.push(gridDiv);
      }
    }
    return children;
  }

  genBBox(l: number, t: number, w: number, h: number, offsetW: number, offsetH: number) {
    let wrapper = this.wrapper.nativeElement;

    let gridDiv = this.renderer.createElement("div");
    gridDiv.setAttribute("class", "bbox");
    let posStyle = "left:" + (l * 9 - 3 + offsetW) + "px; top:" + (t * 9 - 3 + offsetH) + "px; width: " + (9 * w) + "px; height:" + (9 * h) + "px;";
    gridDiv.setAttribute("style", posStyle);
    this.renderer.appendChild(wrapper, gridDiv);
  }

  addEllipsis(l: number, t: number, h: boolean) {
    let wrapper = this.wrapper.nativeElement;

    let val = h ? "	&#x22EF;" : "&#x22EE;";

    let gridDiv = this.renderer.createElement("div");
    gridDiv.innerHTML = val;
    gridDiv.setAttribute("class", "ellipsis");
    let posStyle = "left:" + l + "px; top:" + t + "px;";
    gridDiv.setAttribute("style", posStyle);
    this.renderer.appendChild(wrapper, gridDiv);
  }

  colorCells(colorIndices: number[], cells: any[]) {
    let colorStyle = "background-color: gray !important;";
    let i;
    for(i = 0; i < colorIndices.length; i++) {
      let index = colorIndices[i];
      let cell = cells[index];
      cell.setAttribute("style", cell.getAttribute("style") + ";" + colorStyle);
    }
  }

  createSubGrid(hl: number[], vl: number[], bboxw: number, bboxh: number, offsetW: number, offsetH: number, offsetGW: number, offsetGH: number) {
    let wrapper = this.wrapper.nativeElement;
    
    let i;
    for(i = 0; i < hl.length; i++) {
      let hbar = hl[i];
      let top = hbar * 9 + offsetH + offsetGH * 9 - 1;
      let left = offsetW + offsetGW * 9;
      let width = bboxw * 9;

      let gridDiv = this.renderer.createElement("div");
      gridDiv.setAttribute("class", "hline");
      let posStyle = "left:" + left + "px; top:" + top + "px;";
      posStyle += "width:" + width + "px;";
      gridDiv.setAttribute("style", posStyle);
      this.renderer.appendChild(wrapper, gridDiv);
    }

    let j;
    for(j = 0; j < vl.length; j++) {
      let vbar = vl[j];
      let top = offsetH + offsetGH * 9;
      let left = vbar * 9 + offsetW + offsetGW * 9 - 1;
      let height = bboxh * 9;

      let gridDiv = this.renderer.createElement("div");
      gridDiv.setAttribute("class", "vline");
      let posStyle = "left:" + left + "px; top:" + top + "px;";
      posStyle += "height:" + height + "px;";
      gridDiv.setAttribute("style", posStyle);
      this.renderer.appendChild(wrapper, gridDiv);
    }
  }




  private landCoverPalette(): string[] {

    let maxLCCode = 32;

    //no color (black)
    let nc = "000000";
    //color channels for interpolation
    let r = "ff0000";
    let g = "00ff00";
    let b = "0000ff";

    // let gAdj = 0.0722 / 0.7152;
    // let rAdj = 0.0722 / 0.2126;
    // //console.log(gAdj);
    // let gs = 1.055 * Math.pow(gAdj, 1/2.4) - 0.055;
    // let rs = 1.055 * Math.pow(rAdj, 1/2.4) - 0.055;
    // gs = Math.round(gs * 255);
    // rs = Math.round(rs * 255);
    // console.log(gs.toString(16));
    // console.log(rs.toString(16));

    //set divisions per color
    let rd = 4;
    let gd = 3;
    let bd = 3;

    //create channel divisions using rgb interpolation
    //using rgb instead of lrgb because shifts the scheme logarithmically towards darker colors, which looks nicer
    let rco = this.chroma.scale([nc, r]).mode('lrgb').colors(rd);
    let gco = this.chroma.scale([nc, g]).mode('lrgb').colors(gd);
    let bco = this.chroma.scale([nc, b]).mode('lrgb').colors(bd);

    //strip out individual channels
    rco = rco.map((color) => {
      return color.substring(1, 3);
    });
    gco = gco.map((color) => {
      return color.substring(3, 5);
    });
    bco = bco.map((color) => {
      return color.substring(5, 7);
    });

    let palette = [];

    for(let i = 0; i < rco.length; i++) {
      for(let j = 0; j < gco.length; j++) {
        for(let k = 0; k < bco.length; k++) {
          if(palette.length > maxLCCode + 1) {
            break;
          }
          palette.push("#" + rco[i] + gco[j] + bco[k]);
        }
      }
    }
    //6, 15
    //console.log(palette);

    palette.shift();
    //palette[0] = "#ffffff";

    // let ideal = 1 / (maxLCCode - 1);
    let luminances = [];
    let avg = 0;
    let i;
    for(i = 0; i < palette.length; i++) {
      luminances.push({
        lum: this.chroma(palette[i]).luminance(),
        color: palette[i]
      });
    }
    luminances.sort((a, b) => {
      return a.lum - b.lum;
    });
    let min = 0.02;
    let max = 0.98;
    //console.log(luminances[luminances.length - 1].lum);
    let span = max - min;
    let ideal = span / (luminances.length - 1);
    //console.log(max);
    let pos = min;
    palette = []
    for(i = 0; i < luminances.length; i++, pos += ideal) {
      let color = luminances[i].color;
      //let index = palette.indexOf(color);
      //palette.push(this.chroma(color).luminance(pos));
      palette.push(this.chroma(color));
    }
    // for(i = 0; i < luminances.length - 2; i++) {
    //   let delta = luminances[i + 1] - luminances[i];
    //   avg += delta;
    // }
    // avg /= i;
    // console.log(ideal, avg);

    //palette = this.agitate(palette);
    //console.log(palette);


    let j;
    let totals = [];
    let vals = [];
    let avgs = [];
    let total = 0;
    for(i = 0; i < palette.length - 1; i++) {
      totals.push(0);
      vals.push(0);
    }
    for(i = 0; i < palette.length - 1; i++) {
      //console.log(this.chroma(palette[i]).hsv()[0]);
      // for(j = i + 1; j < palette.length; j++) {
      //   let sep = j - i;
      //   let mod = 1 / sep;
      //   let index = sep - 1;
        
      //   let diff = Math.abs(this.chroma(palette[i]).hsv()[0] - this.chroma(palette[j]).hsv()[0])
      //   if(diff > 180) {
      //     diff = 360 - diff;
      //   }
      //   totals[index] += diff * mod;

      //   vals[index]++;
      // }
      //console.log(this.chroma(palette[i]).hsv()[1]);
      let diff = Math.abs(this.chroma(palette[i]).hsv()[0] - this.chroma(palette[i + 1]).hsv()[0]);
      if(diff > 180) {
        diff = 360 - diff;
      }
      total += diff
    }
    // for(i = 0; i < totals.length; i++) {
    //   avgs.push(totals[i] / vals[i]);
    // }
    // console.log(avgs.reduce((total, val) => {
    //   return total + val;
    // }));
    console.log(total / i);


    return palette;
  }
}
