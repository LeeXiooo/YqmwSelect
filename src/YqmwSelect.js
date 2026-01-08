/* 
  年，季度，月，周，天 组件
  如：上月，当月，本月 按纽功能，下拉框值的初始化等
 
*/

 
(function($){
    "use strict";
    var defaults = {
        DateTypes: {
            AllValue: 0,                    //类型配置全
            AllShow: true,
            YearValue: 5,                   //类型配置年
            YearShow: true,
            QuarterValue: 4,                //类型配置季度  
            QuarterShow: true,
            MonthValue: 3,                  //类型配置月
            MonthShow: true,
            WeekValue: 2,                   //类型配置周
            WeekShow: true,
            DayValue: 1,                    //类型配置日
            DayShow: false
        },
        DefaultValueYear: undefined,        //年默认值,可选
        DefaultValueDate: undefined,        //默认日期值，季度，月，周，,可选
        DateType: 3,                        //默认为月状态
        YearObjID: undefined,               //年输入框DOM对像ID,可选
        DateValObjID: undefined,            //日期值，季度，月，周，输入框DOM对像ID,可选
        ShowLastNowNextBtn: true,           //是否显示上一个，当前，下一个，的按钮
        LastNowNextBtnObjID: undefined,     //上一个，当前，下一个，的按钮DOM对像ID,可选   
        ShowDateType: true,                 //是否显示年，季度，月，周，天类型的单选按纽
        DateTypeObjID: undefined,           //显示日期类型的单选按纽的DOM对像ID,可选
        DateInfoObjID: undefined,           //显示日期范围信息的DOM对像ID，不定义则不显示,可选
        ReadOnly: false,                    //是否只读
        CallMethod: undefined,              //设置或改变值后执行的回调方法
        _isSetting: false                   // 内部标志，防止重复调用CallMethod

    };
 
    function createSelect(target) {
        var opts = $.data(target, 'YqmwSelect').options;
        var dt = opts.DateType;
        var t = $(target);
        
        _renderDateTypeRadio(target,opts);

        var box = opts.DateValObjID ? $('#' + opts.DateValObjID) : t;

        box.append('<span class="spanYear"><input class="YqmwYear" style="width:80px;" /></span><span class="spanDateVal"><input class="YqmwDateVal" style="width:80px;" /></span><span class="spanDayVal"><input class="YqmwDayVal" style="width:88px;" /></span>');

        box.find('input.YqmwYear').numberspinner({
            suffix: '年',
            min: 0,
            disabled: opts.ReadOnly,
            onSpinDown: function () {
                _changeValue(target);
            },
            onSpinUp: function () {
                _changeValue(target);
            }
        });

        box.find('input.YqmwDateVal').combobox({
            editable: false,
            valueField: 'id',
            textField: 'text',
            disabled: opts.ReadOnly,
            onSelect: function () {
                _changeValue(target);
            }
        });

        box.find('input.YqmwDayVal').datebox({
            disabled: opts.ReadOnly,
            formatter: _dateformatter,
            parser: _dateparser,
            onSelect: function () {
                _changeValue(target);
            }
        });
        //alert("opts=" + opts.DateTypes.DayValue);
        if (dt === opts.DateTypes.DayValue) {
            box.find('.spanYear').hide();
            box.find('.spanDateVal').hide();
            box.find('.spanDayVal').show(); 
        }
        else if (dt === opts.DateTypes.AllValue) {
            box.find('.spanYear').hide();
            box.find('.spanDateVal').hide(); 
            box.find('.spanDayVal').hide();
        }
        else {
            box.find('.spanDayVal').hide(); 
            box.find('.spanYear').show(); 
            if (opts.DateType === opts.DateTypes.YearValue) {
                box.find('.spanDateVal').hide();               
            }
            else {
                box.find('.spanDateVal').show(); 
            }
        }        
        if (opts.ShowLastNowNextBtn) {
            var lastnownext;
            if(opts.LastNowNextBtnObjID){
                lastnownext = $('#' + opts.LastNowNextBtnObjID);
            }else{
                t.append('<span id="'+t.id+'-lastnownextbtn"></span>');
                lastnownext = $('#'+t.id + '-lastnownextbtn');
            }
            //var lastnownext = opts.LastNowNextBtnObjID ? $('#' + opts.LastNowNextBtnObjID) : t;
            lastnownext.append('<a class="Yqmw-btnlast">上</a> <a class="Yqmw-btnnow">本</a> <a class="Yqmw-btnnext">下</a>');
            _renderLastNextBtn(target);
            if (opts.DateType === opts.DateTypes.AllValue) {
                lastnownext.hide();
            }
        }
        _initValue(target);
    }

    function _renderDateTypeRadio(target,opts) {
        var t = $(target);
        if (opts.ShowDateType) {
            var switchradio = opts.DateTypeObjID ? $('#' + opts.DateTypeObjID) : t;
            var dt = opts.DateType;
            var dtn = 'YqmwRadio-' + switchradio.attr('id');
            var ro = opts.ReadOnly;

            var str = '';
            if(opts.DateTypes.AllShow){
            str += '<label for="' + dtn + '5"><input type="radio" name="' + dtn + '" id="' + dtn + '5" ' +
                (dt === opts.DateTypes.AllValue ? 'checked="checked"' : '')
                + ' value="' + opts.DateTypes.AllValue + '" />全</label> ';
            }

            if (opts.DateTypes.DayShow) {
                str += '<label for="' + dtn + '0"><input type="radio" name="' + dtn + '" id="' + dtn + '0" ' +
                    (dt === opts.DateTypes.DayValue ? 'checked="checked"' : '')
                    + ' value="' + opts.DateTypes.DayValue + '" />日</label> ';
            }

            if (opts.DateTypes.WeekShow) {
                str += '<label for="' + dtn + '1"><input type="radio" name="' + dtn + '" id="' + dtn + '1" ' +
                    (dt === opts.DateTypes.WeekValue ? 'checked="checked"' : '')
                    + ' value="' + opts.DateTypes.WeekValue + '" />周</label> ';
            }
            if (opts.DateTypes.MonthShow) {
                str += '<label for="' + dtn + '2"><input type="radio" name="' + dtn + '" id="' + dtn + '2" ' +
                    (dt === opts.DateTypes.MonthValue ? 'checked="checked"' : '')
                    + ' value="' + opts.DateTypes.MonthValue + '" />月</label> ';
            }

            if (opts.DateTypes.QuarterShow) {
                str += '<label for="' + dtn + '3"><input type="radio" name="' + dtn + '" id="' + dtn + '3" ' +
                    (dt === opts.DateTypes.QuarterValue ? 'checked="checked"' : '')
                    + ' value="' + opts.DateTypes.QuarterValue + '" />季</label> ';
            }

            if (opts.DateTypes.YearShow) {
                str += '<label for="' + dtn + '4"><input type="radio" name="' + dtn + '" id="' + dtn + '4" ' +
                    (dt === opts.DateTypes.YearValue ? 'checked="checked"' : '')
                    + ' value="' + opts.DateTypes.YearValue + '" />年</label> ';
            }

            switchradio.append(str);

            if (!ro) {
                switchradio.find('input[name="' + dtn + '"]').unbind('click');
                switchradio.find('input[name="' + dtn + '"]').click(function () {
                    var switchradio = opts.DateTypeObjID ? $('#' + opts.DateTypeObjID) : t;
                    var dtn = 'YqmwRadio-' + switchradio.attr('id');
                    var setdt = parseInt(switchradio.find('input[name="' + dtn + '"]:checked').val());

                    _changeType(target, setdt);
                });
            }
            else {
                switchradio.find('input[name="' + dtn + '"]').attr('disabled', ro);
            }
        }
    }

    function _renderLastNextBtn(target) {

        var opts = $.data(target, 'YqmwSelect').options;
        var dt = opts.DateType;

        var t = $(target);

        if (!opts.ShowLastNowNextBtn) {
            return false;
        }

        var lastnownext = opts.LastNowNextBtnObjID ? $('#' + opts.LastNowNextBtnObjID) : $('#'+t.id + '-lastnownextbtn');

        if (dt === opts.DateTypes.AllValue) {
            lastnownext.hide();
            return false;
        } else {
            lastnownext.show();
        }

 
        var objbtnLast = lastnownext.find('a.Yqmw-btnlast');
        var objbtnNow = lastnownext.find('a.Yqmw-btnnow');
        var objbtnNext = lastnownext.find('a.Yqmw-btnnext');  

        objbtnLast.unbind("click");
        objbtnNow.unbind("click");
        objbtnNext.unbind("click");

        var txtLast = '', txtNow = '', txtNext = '';
        switch (dt) {
            case (opts.DateTypes.DayValue): //日
                txtLast = '前一天';
                txtNow = '今天';
                txtNext = '后一天';
                break;
            case (opts.DateTypes.WeekValue): //周
                txtLast = '上一周';
                txtNow = '本周';
                txtNext = '下一周';
                break;
            case (opts.DateTypes.MonthValue): //月
                txtLast = '上一月';
                txtNow = '当月';
                txtNext = '下一月'; 
                break;
            case (opts.DateTypes.QuarterValue): //季
                txtLast = '上一季度';
                txtNow = '本季度';
                txtNext = '下一季度'; 
                break;
            case (opts.DateTypes.YearValue): //年
                txtLast = '上一年';
                txtNow = '今年';
                txtNext = '下一年'; 
                break;
        }
        
        objbtnLast.linkbutton({
            iconCls: 'icon-undo',
            plain: true,
            disabled: opts.ReadOnly,
            text: txtLast
        });
        objbtnLast.click(function () {
            if (opts.ReadOnly) {
                return false;
            }
            _goLast(target);
        });
        objbtnNow.linkbutton({
            iconCls: 'icon-home',
            plain: true,
            disabled: opts.ReadOnly,
            text: txtNow
        });
        objbtnNow.click(function () {
            if (opts.ReadOnly) {
                return false;
            }
            _goNow(target);
        });
        objbtnNext.linkbutton({
            iconCls: 'icon-redo',
            plain: true,
            disabled: opts.ReadOnly,
            text: txtNext
        });
        objbtnNext.click(function () {
            if (opts.ReadOnly) {
                return false;
            }
            _goNext(target);
        });

    }

    function CheckIsCurrent(target) {
        var opts = $.data(target, 'YqmwSelect').options;
        var t = $(target);
        var dt = opts.DateType;

        if (dt === opts.DateTypes.AllValue) {
            return false;
        }

        var box = opts.DateValObjID ? $('#' + opts.DateValObjID) : t;

        var objYear = box.find('input.YqmwYear');
        var objDateVal = box.find('input.YqmwDateVal');

        var y = new Date().getFullYear();
        var dv = 0;
        var iscurr = false;
        switch (dt) {
            case (opts.DateTypes.DayValue): //日 
                iscurr = box.find('input.YqmwDayVal').datebox('getValue') === _dateformatter(new Date());
                break;
            case (opts.DateTypes.WeekValue): //周
                dv = _getWeekIndex(target);
                break;
            case (opts.DateTypes.MonthValue): //月
                dv = new Date().getMonth() + 1;
                break;
            case (opts.DateTypes.QuarterValue): //季
                var m = new Date().getMonth() + 1;
                dv = Math.floor((m % 3 === 0 ? (m / 3) : (m / 3 + 1)));
                break;
            case (opts.DateTypes.YearValue): //年
                iscurr = y === parseInt(objYear.numberspinner('getValue'));
                break;
        }
        if (dt !== opts.DateTypes.YearValue && dt !== opts.DateTypes.DayValue) {
            iscurr = y === parseInt(objYear.numberspinner('getValue')) && dv === parseInt(objDateVal.combobox('getValue'));
        }

        if (!opts.ShowLastNowNextBtn) {
            return false;
        }
        var lastnownext = opts.LastNowNextBtnObjID ? $('#' + opts.LastNowNextBtnObjID) : $('#'+t.id + '-lastnownextbtn');
        var objbtnNow = lastnownext.find('a.Yqmw-btnnow');
        objbtnNow.linkbutton(iscurr ? 'disable' : 'enable');
        if (iscurr) {
            objbtnNow.linkbutton('disable');
            objbtnNow.unbind("click");
        }
        else {
            objbtnNow.linkbutton('enable');
            objbtnNow.unbind("click");
            objbtnNow.click(function () {
                if (opts.ReadOnly) {
                    return false;
                }
                objbtnNow.linkbutton('disable'); 
                _goNow(target);               
            });
        }

        return iscurr;

    }

    function _dealDateInfo(target) {
        var opts = $.data(target, 'YqmwSelect').options;
       
        if (!opts.DateInfoObjID) {
            return false;
        }

        var dt = opts.DateType;

        if (dt === opts.DateTypes.AllValue) {
            $('#'+opts.DateInfoObjID).text('');
        }else{
            $('#'+opts.DateInfoObjID).text(_dateformatter(_getStartDate(target))
            + ' → ' + _dateformatter(_getEndDate(target)));
        }
    }

    function _dateformatter(date) {
        var y = date.getFullYear();
        var m = date.getMonth() + 1;
        var d = date.getDate();
        return y + '-' + (m < 10 ? ('0' + m) : m) + '-' + (d < 10 ? ('0' + d) : d);
    }

    function _dateparser(s) {
        if (!s) return new Date();
        var ss = s.split('-');
        var y = parseInt(ss[0], 10);
        var m = parseInt(ss[1], 10);
        var d = parseInt(ss[2], 10);
        if (!isNaN(y) && !isNaN(m) && !isNaN(d)) {
            return new Date(y, m - 1, d);
        } else {
            return new Date();
        }
    }

    function _getDateType(target) {
        var opts = $.data(target, 'YqmwSelect').options; 
        var dt = opts.DateType;  
        return dt;
    }

    function _getYearValue(target) { 
        var opts = $.data(target, 'YqmwSelect').options;
        var t = $(target);
        var dt = opts.DateType;

        if (dt === opts.DateTypes.DayValue) {
            return 0;
        }
        var box = opts.DateValObjID ? $('#' + opts.DateValObjID) : t;

        var objYear = box.find('input.YqmwYear'); 
        return objYear.numberspinner('getValue'); 
    }

    function _getDateValue(target) {
        var opts = $.data(target, 'YqmwSelect').options;
        var t = $(target);
        var dt = opts.DateType;

        var box = opts.DateValObjID ? $('#' + opts.DateValObjID) : t;
 
        if (dt === opts.DateTypes.DayValue) {
            return box.find('input.YqmwDayVal').datebox('getValue');
        }
        else {
            if (dt !== opts.DateTypes.YearValue) {
                return box.find('input.YqmwDateVal').combobox('getValue');
            }
        }
    }

    function _getStartDate(target) {
        var opts = $.data(target, 'YqmwSelect').options;
        var t = $(target);
        var dt = opts.DateType;

        var y = _getYearValue(target);
        var m = 0, d = 1;
        var dv = _getDateValue(target); 
        switch (dt) {
            case (opts.DateTypes.DayValue): //日
                return _dateparser(dv); 
            case (opts.DateTypes.WeekValue): //周
                var firstDay = _getFirstWeekBegDay(y);
                //7*24*3600000 是一星期的时间毫秒数,(JS中的日期精确到毫秒)
                var time = (dv - 1) * 7 * 24 * 3600000;
                var beginDay = firstDay;
                //为日期对象 date 重新设置成时间 time
                beginDay.setTime(firstDay.valueOf() + time);
                return beginDay; 
            case (opts.DateTypes.MonthValue): //月
                m = dv;
                d = 1;
                break;
            case (opts.DateTypes.QuarterValue): //季
                m = dv * 3 - 2;
                d = 1;
                break;
            case (opts.DateTypes.YearValue): //年
                m = 1;
                d = 1;
                break;
        }
        return new Date(y, m - 1, d);
    }

    function _getEndDate(target) {
        var opts = $.data(target, 'YqmwSelect').options;
        var t = $(target);
        var dt = opts.DateType;

        var y = _getYearValue(target);
        var m = 0, d = 1;
        var dv = _getDateValue(target);
        switch (dt) {
            case (opts.DateTypes.DayValue): //日
                return _dateparser(dv); 
            case (opts.DateTypes.WeekValue): //周
                var firstDay = _getFirstWeekBegDay(y);
                //7*24*3600000 是一星期的时间毫秒数,(JS中的日期精确到毫秒)
                var time = (dv - 1) * 7 * 24 * 3600000;
                var weekTime = 6 * 24 * 3600000;
                var endDay = firstDay;
                //为日期对象 date 重新设置成时间 time
                endDay.setTime(firstDay.valueOf() + weekTime + time);
                return endDay; 
            case (opts.DateTypes.MonthValue): //月
                m = dv;
                return new Date(y, m, 0); 
            case (opts.DateTypes.QuarterValue): //季
                m = dv * 3;
                return new Date(y, m, 0); 
            case (opts.DateTypes.YearValue): //年
                m = 12;
                return new Date(y, m, 0); 
        }
        return new Date(y, m - 1, d);
    }

    //获取某年的第一天
    function _getFirstWeekBegDay(year) {
        var tempdate = new Date(year, 0, 1);
        var temp = tempdate.getDay();
        if (temp === 1) {
            return tempdate;
        }
        temp = temp === 0 ? 7 : temp;
        tempdate = tempdate.setDate(tempdate.getDate() + (8 - temp));
        return new Date(tempdate);
    }

    function _initValue(target) {
        var opts = $.data(target, 'YqmwSelect').options;
        var t = $(target);
        var dt = opts.DateType;

        var box = opts.DateValObjID ? $('#' + opts.DateValObjID) : t;

        var objYear = box.find('input.YqmwYear');
        var objDateVal = box.find('input.YqmwDateVal');

        if (dt === opts.DateTypes.DayValue) {
            if (opts.DefaultValueDate) {
                _setValues(target, {
                    Year: opts.DefaultValueYear,
                    DateValue: opts.DefaultValueDate
                }, true);
            }
            else {
                _goNow(target, true);
            }
        }
        else {
            objDateVal.combobox('loadData', GetDateValueData(target));
            if (opts.DefaultValueYear) {
                _setValues(target, {
                    Year: opts.DefaultValueYear,
                    DateValue: opts.DefaultValueDate
                }, true);

            }
            else {
                _goNow(target, true);
            }
        }
        
    }

    function _setValues(target, values, isinit) {
        var opts = $.data(target, 'YqmwSelect').options;
        var t = $(target);
        var dt = opts.DateType;

        opts._isSetting = true; // 添加标志，防止重复调用

        var box = opts.DateValObjID ? $('#' + opts.DateValObjID) : t;
        var objDateVal = null;
        if (dt === opts.DateTypes.DayValue) {
            objDateVal = box.find('input.YqmwDayVal');
            objDateVal.datebox('setValue', values.DateValue);

        } else { 
            var objYear = box.find('input.YqmwYear');

            objYear.numberspinner('setValue', values.Year);
            if (dt !== opts.DateTypes.YearValue) {
                objDateVal = box.find('input.YqmwDateVal');
                objDateVal.combobox('setValue', values.DateValue);
            }
        }
        //opts.DateType = values.DateType;
        //// 在 spanAmountYqmwDate 元素下查找对应 value 的 radio 并设置为选中
        //box.find('input[type="radio"][value="' + values.DateType + '"]').prop('checked', true);
        
        CheckIsCurrent(target);
        _dealDateInfo(target);

        opts._isSetting = false; // 清除标志

        if (!isinit && opts.CallMethod && typeof (opts.CallMethod) === "function") {
            opts.CallMethod.call(target);
        }
    }
 
    function GetDateValueData(target) {
        var opts = $.data(target, 'YqmwSelect').options;
        var dt = opts.DateType;
        var str1 = '', str2 = '月';
        var len = 12;
        switch (dt) {
            case (opts.DateTypes.WeekValue): //周
                str1 = '第';
                str2 = '周';
                len = 52;
                break;
            case (opts.DateTypes.MonthValue): //月
                str1 = '';
                str2 = '月';
                len = 12;
                break;
            case (opts.DateTypes.QuarterValue): //季
                str1 = '第';
                str2 = '季度';
                len = 4;
                break;
        }
        var dat = [];
        for (var i = 1; i <= len; i++) {
            dat.push({
                id: i,
                text: str1 + i + str2
            });
        }
        return dat;
    }

    function _goLast(target) {
        var opts = $.data(target, 'YqmwSelect').options;
        var t = $(target);
        var dt = opts.DateType;

        var box = opts.DateValObjID ? $('#' + opts.DateValObjID) : t;
        var objDateVal = null;
        var y = 0, dv = 0;
        if (dt === opts.DateTypes.DayValue) {
            objDateVal = box.find('input.YqmwDayVal');
            dv = objDateVal.datebox('getValue');
        }
        else {
            var objYear = box.find('input.YqmwYear');
            y = parseInt(objYear.numberspinner('getValue'));
            if (dt !== opts.DateTypes.YearValue) {
                objDateVal = box.find('input.YqmwDateVal');
                dv = parseInt(objDateVal.combobox('getValue'));
            }
        }
         
        switch (dt) {
            case (opts.DateTypes.DayValue): //日
                dv = _dateformatter(new Date(_dateparser(dv).getTime() - 24 * 60 * 60 * 1000));
                break;
            case (opts.DateTypes.WeekValue): //周
                dv--;
                if (dv <= 0) {
                    y--;
                    dv = 52;
                }
                break;
            case (opts.DateTypes.MonthValue): //月
                dv--;
                if (dv <= 0) {
                    y--;
                    dv = 12;
                }
                break;
            case (opts.DateTypes.QuarterValue): //季
                dv--;
                if (dv <= 0) {
                    y--;
                    dv = 4;
                }
                break;
            case (opts.DateTypes.YearValue): //年
                y--;
                break;
        }
        _setValues(target, {
            Year: y,
            DateValue: dv
        });
    } 
    function _goNow(target, isinit) {
        var opts = $.data(target, 'YqmwSelect').options;
        var t = $(target);
        var dt = opts.DateType;

        var y = new Date().getFullYear();
        var dv = 0;
        switch (dt) {
            case (opts.DateTypes.DayValue): //日
                dv = _dateformatter(new Date());
                break; 
            case (opts.DateTypes.WeekValue): //周
                dv = _getWeekIndex();
                break;
            case (opts.DateTypes.MonthValue): //月
                dv = new Date().getMonth() + 1;
                break;
            case (opts.DateTypes.QuarterValue): //季
                var m = new Date().getMonth() + 1;
                var q = Math.floor((m % 3 === 0 ? (m / 3) : (m / 3 + 1)));
                dv = q;
                break;
        }
        _setValues(target, {
            Year: y,
            DateValue: dv
        }, isinit); 
    }
    function _goNext(target) {
        var opts = $.data(target, 'YqmwSelect').options;
        var t = $(target);
        var dt = opts.DateType;
        var box = opts.DateValObjID ? $('#' + opts.DateValObjID) : t;
        
        var y = 0, dv = 0;
        var objDateVal = null;
        if (dt === opts.DateTypes.DayValue) {
            objDateVal = box.find('input.YqmwDayVal');
            dv = objDateVal.datebox('getValue');
        }
        else {
            var objYear = box.find('input.YqmwYear');
            y = parseInt(objYear.numberspinner('getValue'));
            if (dt !== opts.DateTypes.YearValue) {
                objDateVal = box.find('input.YqmwDateVal');
                dv = parseInt(objDateVal.combobox('getValue'));
            }
        }
        switch (dt) {
            case (opts.DateTypes.DayValue): //日
                dv = _dateformatter(new Date(_dateparser(dv).getTime() + 24 * 60 * 60 * 1000));
                break;
            case (opts.DateTypes.WeekValue): //周
                dv++;
                if (dv > 52) {
                    y++;
                    dv = 1;
                }
                break;
            case (opts.DateTypes.MonthValue): //月
                dv++;
                if (dv > 12) {
                    y++;
                    dv = 1;
                }
                break;
            case (opts.DateTypes.QuarterValue): //季
                dv++;
                if (dv > 4) {
                    y++;
                    dv = 1;
                }
                break;
            case (opts.DateTypes.YearValue): //年
                y++;
                break;
        }
        _setValues(target, {
            Year: y,
            DateValue: dv
        }); 
    } 

    function _getWeekIndex() {  //取当前时间的一年中的第几周
        var totalDays = 0;
        var now = new Date();
        var years = now.getYear();
        if (years < 1000)
            years += 1900;
        var days = new Array(12);
        days[0] = 31;
        days[2] = 31;
        days[3] = 30;
        days[4] = 31;
        days[5] = 30;
        days[6] = 31;
        days[7] = 31;
        days[8] = 30;
        days[9] = 31;
        days[10] = 30;
        days[11] = 31;

        //判断是否为闰年，针对2月的天数进行计算
        if (Math.round(now.getYear() / 4) === now.getYear() / 4) {
            days[1] = 29;
        } else {
            days[1] = 28;
        }

        if (now.getMonth() === 0) {
            totalDays = totalDays + now.getDate();
        } else {
            var curMonth = now.getMonth();
            for (var count = 1; count <= curMonth; count++) {
                totalDays = totalDays + days[count - 1];
            }
            totalDays = totalDays + now.getDate();
        }
        //得到第几周
        var week = Math.round(totalDays / 7);
        return week + 1;
    }

    function _changeValue(target) {
        var opts = $.data(target, 'YqmwSelect').options;
        var t = $(target);
        var dt = opts.DateType;
 
        if (opts._isSetting) return; // 如果正在设置值，跳过调用

        CheckIsCurrent(target);
        _dealDateInfo(target);

        if (opts.CallMethod && typeof (opts.CallMethod) === "function") {
            opts.CallMethod.call(target);
        }
    }

    function _changeType(target,setdt) {
        var opts = $.data(target, 'YqmwSelect').options;
        var t = $(target);
        var dt = opts.DateType;       

        opts._isSetting = true; // 在切换类型期间，防止_changeValue调用

        //if (!opts.ShowDateType) {
        //    return false;
        //}
 
        if (dt === setdt) {
            opts._isSetting = false;
            return false;
        }
        else {
            opts.DateType = setdt;
        }

        var box = opts.DateValObjID ? $('#' + opts.DateValObjID) : t;
        var switchradio = opts.DateTypeObjID ? $('#' + opts.DateTypeObjID) : t;
        var dtn = 'YqmwRadio-' + switchradio.attr('id');
         
        switchradio.find('input[name="'+dtn+'"][value="' + setdt + '"]').attr('checked', true);
        if (setdt === opts.DateTypes.DayValue) {
            box.find('.spanYear').hide();
            box.find('.spanDateVal').hide(); 
            box.find('.spanDayVal').show(); 

        }
        else if (setdt === opts.DateTypes.AllValue) {             
            box.find('.spanYear').hide();
            box.find('.spanDateVal').hide(); 
            box.find('.spanDayVal').hide();
            // 隐藏按钮
            var lastnownext = opts.LastNowNextBtnObjID ? $('#' + opts.LastNowNextBtnObjID) : $('#'+t.id + '-lastnownextbtn');
            lastnownext.hide();
        }
        else {
            box.find('.spanDayVal').hide(); 
            box.find('.spanYear').show(); 
            if (opts.DateType === opts.DateTypes.YearValue) {
                box.find('.spanDateVal').hide();
            }
            else {
                box.find('.spanDateVal').show(); 
            }
            // 显示按钮
            var lastnownext = opts.LastNowNextBtnObjID ? $('#' + opts.LastNowNextBtnObjID) : $('#'+t.id + '-lastnownextbtn');
            lastnownext.show();
        }
 
        _renderLastNextBtn(target);
        _initValue(target);
        //_goNow(target); 
        opts._isSetting = false; // 清除标志

        if (opts.CallMethod && typeof (opts.CallMethod) === "function") {
            opts.CallMethod.call(target);
        }
    }

    $.fn.YqmwSelect = function (options, param) {
        if (typeof options === 'string') {
            var method = $.fn.YqmwSelect.methods[options];
            if (method) {
                return method(this, param);
            } else {
                return this.YqmwSelect(options, param);
            }
        }

        options = options || {};
        return this.each(function () {
            var state = $.data(this, 'YqmwSelect');
            if (state) {
                $.extend(true, state.options, options);
            } else {
                $.data(this, 'YqmwSelect', {
                    options: $.extend(true, {}, defaults, options)
                });
                
            } 
            createSelect(this);
        });
    };

    $.fn.YqmwSelect.methods = {
        getStartDate: function (jq, param) {
            return param ? _dateformatter(_getStartDate(jq[0])) : _getStartDate(jq[0]);
        },
        getEndDate: function (jq, param) {
            return param ? _dateformatter(_getEndDate(jq[0])) : _getEndDate(jq[0]);
        },
        getValue: function (jq) {
            return {
                DateType: _getDateType(jq[0]),
                Year: _getYearValue(jq[0]),
                DateValue: _getDateValue(jq[0])
            };
        },
        getDateType: function (jq) {
            return _getDateType(jq[0]);
        },
        setDateType: function (jq, param) {
            return _changeType(jq[0], param);
        },
        setValue: function (jq, param) {
            return jq.each(function () {
                if (param.Year) {
                    _setValues(this, param);
                }
            });            
        },
        goLast: function (jq) {
            return jq.each(function () {
                _goLast(this);
            }); 
        },
        goNow: function (jq) {
            return jq.each(function () {
                _goNow(this);
            });
        }, 
        goNext: function (jq) {
            return jq.each(function () {
                _goNext(this);
            });
        }

    };

})(jQuery);
