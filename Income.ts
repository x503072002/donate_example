import { Common, ApiResult, ActionFlagModel } from "../../Comm/1.0.3/Comm.js";
import { createApp } from "../../../Scripts/vue.esm-browser.prod.js"
import Mixins from "../../../Controllers/Comm/1.0.3/mixins/mixins.js"
import { Router } from "../../Comm/1.0.3/Router.js"




let fristTime:any = {
    DATETIME: false,
    USERLIST: false,
    BANDLIST: false,
    DONATESTATUSLIST: false,
    PLAT: false
};

let lastquery:any = {} ;

let pageshow = 20;
class Income {
    static ME: any;

    VueData = {
        query: {
            donate_time_st: "",
            donate_time_ed: "",
            band_id: "",
            account: "",
            donate_no:"",
            donate_status: "",
            donate_plat:""
        },
        datetime: {},
        userlist: [],
        bandlist: [],
        donateplatlist:[],
        donatestatuslist:[],
        totalIncomeData: [],
        incomeData: [],
        nowpage:1,
        totalpage: 1,
        totallegth: 0,
        userRank: "",
        total_amount:0
    }
    constructor() {
        if (Common.checkUser()) {
            this.init();
        } 
    }

    initData() {
        let me = Income.ME;
        let nowDate = new Date();
        let beforeData = new Date(nowDate.getTime() - 7 * 24 * 3600 * 1000);
        let userdata = Common.getCurrentUser();
        me.VueData.query.donate_no = "";
        me.VueData.query.donate_status = "";
        me.VueData.query.band_id = userdata.rank == 10 ? "" : userdata.band_id;
        me.VueData.query.account = userdata.rank == 10 ? "" : userdata.account;
        me.VueData.query.donate_time_st = beforeData.getFullYear() + "/" + (beforeData.getMonth() + 1) + "/" + beforeData.getDate();
        me.VueData.query.donate_time_ed = nowDate.getFullYear() + "/" + (nowDate.getMonth() + 1) + "/" + nowDate.getDate();
    }

    init() {
        let me = this;
        Income.ME = this;
        let userdata = Common.getCurrentUser();
        me.VueData.userRank = userdata.rank;
        me.initData();
        let bind_ddl = ((result: ApiResult, senddata: any) => {
            if (!result.successful) {
                alert(result.msg);
                return;
            }
            switch (senddata.param1) {
                case "DATETIME":
                    me.VueData.datetime = result.data;
                    fristTime.DATETIME = true;
                    break;
                case "USERLIST":
                    me.VueData.userlist = result.data;
                    fristTime.USERLIST = true;
                    break;
                case "BANDLIST":
                    me.VueData.bandlist = result.data;
                    Common.postdata("../api/DataCenter", ActionFlagModel.GET_DDL_DATA, { param1: "USERLIST", param2: userdata.band_id }, bind_ddl);
                    fristTime.BANDLIST = true;
                    break;
                case "DONATESTATUSLIST":
                    me.VueData.donatestatuslist = result.data;
                    fristTime.DONATESTATUSLIST = true;
                    break;
                case "PLAT":
                    me.VueData.donateplatlist = result.data != null && result.data != "" ? result.data : [];
                    fristTime.PLAT = true;
                    break;
            }
        });

        Common.postdata("../api/DataCenter", ActionFlagModel.GET_DDL_DATA, { param1: "DATETIME" }, bind_ddl);
        Common.postdata("../api/DataCenter", ActionFlagModel.GET_DDL_DATA, { param1: "BANDLIST" }, bind_ddl);
        Common.postdata("../api/DataCenter", ActionFlagModel.GET_DDL_DATA, { param1: "DONATESTATUSLIST" }, bind_ddl);
        Common.postdata("../api/DataCenter", ActionFlagModel.GET_DDL_DATA, { param1: "PLAT" }, bind_ddl);
        this.startApp();
    }

    onSearchComplete(result: ApiResult) {
        let me = Income.ME;
       
        if (!result.successful) {
            me.Clear();
            alert(result.msg);
            Common.hideLoading();
            return;
        }
        Common.hideLoading();

        me.VueData.totalIncomeData = result.data;
        me.VueData.nowpage = 1;
        me.VueData.incomeData = (result.data).slice(0, pageshow);
        me.VueData.totallegth = result.data.length;
        me.VueData.totalpage = Math.round(me.VueData.totallegth / pageshow);
        if (me.VueData.totallegth > me.VueData.totalpage * pageshow) {
            me.VueData.totalpage = me.VueData.totalpage + 1;
        }

        if (me.VueData.totallegth > 0) {
            me.VueData.total_amount = me.VueData.totalIncomeData[0].total_amount || 0;
        }
    }

    private startApp() {
        let me = this;
        var check = true;
        for (const value in fristTime) {
            if (!fristTime[value]) {
                check = false;
                break;
            }
        }
        if (check) {
            let Vue:any = createApp({
                data() {
                    return me.VueData;
                },
                created() {
                    $("#app").show();
                    Common.postdata("../api/DataCenter", ActionFlagModel.GET_DONATE_MSG_DATA, {}, me.onSearchComplete);
                    setTimeout(() => {
                        let $1:any = $;
                        let query = me.VueData.query;
                        $1("#datepicker").datepicker({
                            orientation:"bottom",
                            format: "yyyy/mm/dd",
                            language: "zh-TW",
                            autoclose: true,
                            todayBtn: "linked",
                            keyboardNavigation: false
                        });
                        $1("#datepickerstart").blur(() => {
                            if (query.donate_time_st != $1("#datepickerstart").val()) {
                                query.donate_time_st = $1("#datepickerstart").val();
                                $1("#datepickerstart").datepicker("setDate", $1("#datepickerstart").val());
                            }
                        });
                        $1("#datepickerend").blur(() => {
                            if (query.donate_time_ed != $1("#datepickerend").val()) {
                                query.donate_time_ed = $1("#datepickerend").val();
                                $1("#datepickerend").datepicker("setDate", $1("#datepickerend").val());
                            }
                        });
                        $1("#datepickerstart").datepicker().on("changeDate", function (e: any) {
                            query.donate_time_st = $1("#datepickerstart").val();
                        });
                        $1("#datepickerend").datepicker().on("changeDate", function (e: any) {
                            query.donate_time_ed = $1("#datepickerend").val();
                        });
                    }, 500);

                },
                methods: {
                    onChangeQuick: (event: any) => {
                        let value = event.target.value;
                        lastquery = { quickdate: value };
                        Common.showloading();
                        Common.postdata("../api/DataCenter", ActionFlagModel.GET_DONATE_MSG_DATA, {quickdate: value}, me.onSearchComplete);
                    },
                    onChangePage: (value: any) => {
                        if (value < 1 || value > me.VueData.totalpage || value == me.VueData.nowpage) {
                            return;
                        }
                        me.VueData.nowpage = value;
                        let start = (value-1) * pageshow;
                        let end = value * pageshow;
                        end = end > me.VueData.totallegth ? me.VueData.totallegth : end;
                        me.VueData.incomeData = (me.VueData.totalIncomeData).slice(start, end);
                    },
                    onClickSearch() {
                        if ($("#query").is(":visible")) {
                            lastquery = me.VueData.query;
                            Common.showloading();
                            Common.postdata("../api/DataCenter", ActionFlagModel.GET_DONATE_MSG_DATA, me.VueData.query, me.onSearchComplete);
                        } else {
                            $("#query").collapse("show");
                        }
                    },
                    onClickExport() {
                        Common.showloading();
                        Common.postdata("../api/DataCenter", ActionFlagModel.EXPORT_DONATE_MSG_DATA, lastquery, Common.Exportcsv);
                    },
                    onClickClear() {
                        me.Clear(true);
                    }
                },
                watch: {
                    "query.band_id": (value: any) => {
                        let bind_ddl = (result: ApiResult) => {
                            if (!result.successful) {
                                alert(result.msg);
                                return;
                            }
                            let userdata = Common.getCurrentUser();
                            me.VueData.userlist = result.data;
                            let array: [] = result.data;
                            me.VueData.query.account = result.data[0]["id"];
                            //沒有全部就設定自己
                            if (result.data[0]["id"] != '') {
                                array.forEach((data) => {
                                    if (userdata.account == data["id"]) {
                                        me.VueData.query.account = data["id"];
                                    }
                                });
                            }
                        };

                        Common.postdata("../api/DataCenter", ActionFlagModel.GET_DDL_DATA, { param1: "USERLIST", param2: value }, bind_ddl);
                    }
                },
                mixins: [Mixins]
            }).mount("#app");
            me.VueData = Vue.$data;
        } else {
            setTimeout(() => { this.startApp(); }, 200);
        }
    }

    private Clear(Isquery: boolean = false) {
        let me = Income.ME;
        if (Isquery) {
            me.initData();
        }
        me.VueData.totalIncomeData = [];
        me.VueData.nowpage = 1;
        me.VueData.incomeData = [];
        me.VueData.totallegth = 0;
        me.VueData.total_amount = 0;
        me.VueData.totalpage = 1;
    }
}
$(() => { new Income(); })
