if(!AnyConverter){
	var AnyConverter = function(){};
}
(function(window){
	var ConvNumeral = function(){};
	ConvNumeral.prototype = {
		// 桁数表記
		digit_kanji         : ["","十","百","千"],
		digit_daiji         : ["","拾","陌","阡"],
		digit_yomi          : ["","じゅう","ひゃく","せん"],
		digit_yomi_for_number : [
			["","","","","","","","","",""],
			["","じゅう","じゅう","じゅう","じゅう","じゅう","じゅう","じゅう","じゅう","じゅう"],
			["","ひゃく","ひゃく","びゃく","ひゃく","ひゃく","ぴゃく","ひゃく","ぴゃく","ひゃく"],
			["","せん","せん","ぜん","せん","せん","せん","せん","せん","せん"]
		],
		// 置換数値配列（０～９）
		number_2byte        : ["０","１","２","３","４","５","６","７","８","９"],
		number_kanji        : ["〇","一","二","三","四","五","六","七","八","九"],
		number_daiji        : ["零","壱","弐","参","肆","伍","陸","漆","捌","玖"],
		number_yomi_for_digit : [
			 ["ぜろ","いち","に","さん","よん","ご","ろく","なな","はち","きゅう"],
			 ["","いち","に","さん","よん","ご","ろく","なな","はち","きゅう"],
			 ["","いっ","に","さん","よん","ご","ろっ","なな","はっ","きゅう"],
			 ["","いっ","に","さん","よん","ご","ろく","なな","はっ","きゅう"]
		],
		// 4桁区切りの命数法（大数）
		numeral_taisu_kanji : ["","万","億","兆","京","垓","秭","穣","溝","澗","正","載","極","恒河沙","阿僧祇","那由他","不可思議","無量大数"],
		numeral_taisu_daiji : ["","萬","億","兆","京","垓","秭","穣","溝","澗","正","載","極","恒河沙","阿僧祇","那由他","不可思議","無量大数"],
		numeral_taisu_yomi  : ["","まん","おく","ちょう","けい","がい","し","じょう","こう","かん","せい","さい","ごく","ごうがしゃ","あそうぎ","なゆた","ふかしぎ","むりょうたいすう"],
		// 1桁区切りの命数法（少数）
		numeral_shosu_kanji : ["．","分","厘","毛","糸","忽","微","繊","沙","塵","埃","渺","漠","模糊","逡巡","須臾","瞬息","弾指","刹那","六徳","虚空","清浄","阿頼耶","阿摩羅","涅槃寂静"],
		numeral_shosu_yomi  : ["","ぶ","りん","もう","し","こつ","び","せん","しゃ","じん","あい","びょう","ばく","もこ","しゅんじゅん","しゅゆ","しゅんそく","だんし","せつな","りっとく","こくう","しょうじょう","あらや","あまら","ねはんじゃくじょう"],
		brackets            : "()",
		omit1               : false,
		yomi                : false,
		messages : {
			"empty" : "入力が空です。",
			"unmatch" : "入力が数値形ではありません。",
			"overflow" : "入力が許容値を超えています。（大数：72桁、少数：24桁）"
		},
		getOptions : function(opt1, opt2){
			var _default = {
				"number"           : this.number_kanji,
				"digit"            : this.digit_kanji,
				"numeraltaisu"     : this.numeral_taisu_kanji,
				"numeralshosu"     : this.numeral_shosu_kanji,
				"numeralyomitaisu" : this.numeral_taisu_yomi,
				"numeralyomishosu" : this.numeral_shosu_yomi,
				"digityomi"        : this.digit_yomi,
				"digityomi4number" : this.digit_yomi_for_number,
				"numberyomi4digit" : this.number_yomi_for_digit,
				"brackets"         : this.brackets,
				"omit1"            : this.omit1,
				"yomi"             : this.yomi
			};
			var ret = this.extend(_default, opt1, opt2);
			return ret;
		},
		extend : function(){
			var args = [].slice.call(arguments);
			var to = args.shift();
			for(var i in args){
				var from = args[i];
				for(var item in from){
					to[item] = from[item];
				};
			};
			return to;
		},
		getbrackets : function(str){
			var _str = (!!str && str.length > 1) ? str : this.brackets;
			return {
				s : _str.charAt(0),
				e : _str.charAt(_str.length - 1)
			}
		},
		validate : function(num){
			var numstr = (num + "").replace(/,/g, "");
			ret = {
				invalid : false,
				msg : ""
			};
			if(numstr.length <= 0){
				ret.invalid = true;
				ret.msg = this.messages.empty;
			}
			else if(!numstr.match(/^(\d+(\.\d+)?)$/)){
				ret.invalid = true;
				ret.msg = this.messages.unmatch;
			}
			else if(!numstr.match(/^(\d{1,72}(\.\d{0,24})?)$/)){
				ret.invalid = true;
				ret.msg = this.messages.overflow;
			}
			return ret;
		},
		tokanji : function(num, opt){
			var args = this.getOptions({
				"num" : num,
				"number" : this.number_kanji,
				"digit" : this.digit_kanji,
				"numeraltaisu" : this.numeral_taisu_kanji
			}, opt);
			return this.convert(args);
		},
		todaiji : function(num, opt){
			var args = this.getOptions({
				"num" : num,
				"number" : this.number_daiji,
				"digit" : this.digit_daiji,
				"numeraltaisu" : this.numeral_taisu_daiji
			}, opt);
			return this.convert(args);
		},
		convert_taisu : function(args){
			var self = this;
			var taisu = args.numstr.split(".")[0] || "";
			// 大数保持
			var taiarr = [];
			// 読み仮名保持
			var yomiarr = [];
			// 命数法桁毎の万進法単位での数値保持（不要な桁数表記除外のため）
			var numarr = [];
			for(var curr=0; curr < taisu.length; curr++){
				var dig = taisu.length - curr - 1;
				var num = parseInt(taisu.charAt(curr), 10);
				var mansindigit = dig % 4;
				var numeraldigit = dig / 4;
				if(taisu.length == 1 || num != 0){
					if(!args.omit1 || num != 1 || mansindigit == 0){
						numarr.push(args.number[num]);
						yomiarr.push(args.numberyomi4digit[mansindigit][num]);
					}
					numarr.push(args.digit[mansindigit]);
					yomiarr.push(args.digityomi4number[mansindigit][num]);
				}
				// 万進法１桁時に命数法桁を出力（有効数値がある場合のみ）
				if(mansindigit == 0 && numarr.length > 0){
					numarr.push(args.numeraltaisu[numeraldigit]);
					yomiarr.push(args.numeralyomitaisu[numeraldigit]);
					if(!!args.yomi){
						numarr.push(args.brackets.s + yomiarr.join("") + args.brackets.e);
					}
					taiarr.push(numarr.join(""));
					yomiarr = [];
					numarr = [];
				}
			};
			var ret = taiarr.join("");
			if(taisu.length <= 0) ret = args.number[0];
			return ret;
		},
		convert_shosu : function(args){
			var self = this;
			var shosu = args.numstr.split(".")[1] || "";
			if(shosu.length <=0) return "";
			var shoarr = [];
			for(var curr=0; curr < shosu.length; curr++){
				var dig = curr + 1;
				var num = parseInt(shosu.charAt(curr));
				var yomiarr = [];
				if(num != 0){
					shoarr.push(args.number[num]);
					shoarr.push(args.numeralshosu[dig]);
					if(!!args.yomi){
						yomiarr.push(args.numberyomi4digit[0][num]);
						yomiarr.push(args.numeralyomishosu[dig]);
						shoarr.push(args.brackets.s + yomiarr.join("") + args.brackets.e);
					}
				}
			};
			if(shosu.length > 0){
				ret = args.numeralshosu[0] + shoarr.join("");
			}
			return ret;
		},
		convert : function(args){
			var self = this;
			var validresult = this.validate(args.num);
			args.numstr = (args.num + "").replace(/,/,"").replace(/^0+(\.0+)?$/,"0");
			if(!!validresult.invalid){
				return validresult.msg;
			}
			args.brackets = self.getbrackets(args.brackets);
			var taisu = this.convert_taisu(args);
			var shosu = this.convert_shosu(args);
			return taisu + shosu;
		}
	};
	AnyConverter.prototype.numeral = new ConvNumeral();
})(window);
