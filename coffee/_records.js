var Records;

Records = (function() {
    function Records() {}

    Records.displayRecords = function (current_records){
        var callback = function() {
            viewHelper.clearContent();
            viewHelper.referrer.bridge = true;
            viewHelper.referrer.match_id = null;
            viewHelper.referrer.account_id = Number(player.account_id);
            viewHelper.showMatch(current_records[this.id].match.match_id);
        };
        
        for (var key in current_records) {
            var hero_img = ViewUtils.getHeroInfo(constants, current_records[key].match.player_info.hero_id).img;
            hero_img = hero_img.replace(/\\/g, "\\\\");
            hero_img = hero_img.replace("file://", "file:///");
            d3.select("#" + key)
                .html($("#" + key).data().value + "<br>" +current_records[key].value)
                .classed("dullness",true)
                .classed("brightnessfilter",true)
                .style("background-image", "url(" + hero_img + ")")
                .on("click", callback);

        }
    };
    
    Records.updateRecords = function (){
        var current_records = {
            "longest_match":
            {
                "value":0,
                "match":0
            },
            "most_kills": {
                "value":0,
                "match":0
            },
            "most_deaths": {
                "value":0,
                "match":0
            },
            "most_last_hits":{
                "value":0,
                "match":0
            },
            "most_hero_damage":{
                "value":0,
                "match":0
            },
            "most_tower_damage":{
                "value":0,
                "match":0
            }
        };
        if (matches.length)
        {
            matches.forEach(function(d) {
                current_records =
                {
                    "longest_match":
                    {
                        "value": d.duration > current_records["longest_match"]["value"] ? d.duration : current_records["longest_match"]["value"],
                        "match": d.duration > current_records["longest_match"]["value"] ? d : current_records["longest_match"]["match"]
                    },
                    "most_kills": {
                        "value": d.player_info.kills > current_records["most_kills"]["value"] ? d.player_info.kills : current_records["most_kills"]["value"],
                        "match": d.player_info.kills > current_records["most_kills"]["value"] ? d : current_records["most_kills"]["match"]
                    },
                    "most_deaths": {
                        "value": d.player_info.deaths > current_records["most_deaths"]["value"] ? d.player_info.deaths : current_records["most_deaths"]["value"],
                        "match": d.player_info.deaths > current_records["most_deaths"]["value"] ? d : current_records["most_deaths"]["match"]
                    },
                    "most_last_hits":{
                        "value": d.player_info.last_hits  > current_records["most_last_hits"]["value"] ? d.player_info.last_hits : current_records["most_last_hits"]["value"],
                        "match": d.player_info.last_hits  > current_records["most_last_hits"]["value"] ? d : current_records["most_last_hits"]["match"]
                    },
                    "most_hero_damage":{
                        "value": d.player_info.hero_damage > current_records["most_hero_damage"]["value"] ? d.player_info.hero_damage : current_records["most_hero_damage"]["value"],
                        "match": d.player_info.hero_damage > current_records["most_hero_damage"]["value"] ? d : current_records["most_hero_damage"]["match"]
                    },
                    "most_tower_damage":{
                        "value": d.player_info.tower_damage > current_records["most_tower_damage"]["value"] ? d.player_info.tower_damage : current_records["most_tower_damage"]["value"],
                        "match": d.player_info.tower_damage > current_records["most_tower_damage"]["value"] ? d : current_records["most_tower_damage"]["match"]
                    }
                };
            
            });
            
            // change longest match to show duration in minutes and seconds, not seconds
            var hours = Math.floor(current_records["longest_match"]["value"] / 60);
            var seconds = current_records["longest_match"]["value"] % 60;
            
            // if seconds is one digit, pad with 0
            seconds = (seconds / 10 < 1) ? "0" + seconds : seconds;
            
            current_records["longest_match"]["value"] = hours + ":" + seconds;
            
            // change hero and tower damage numbers to include thousands separator
            var thousands = d3.format(",d");
            
            current_records["most_hero_damage"]["value"] = thousands(current_records["most_hero_damage"]["value"]);
            current_records["most_tower_damage"]["value"] = thousands(current_records["most_tower_damage"]["value"]);

            Records.displayRecords(current_records);
        }
        else
        {
            for (var key in current_records)
            {
                d3.select("#" + key)
                    .html("No record available")
                    .classed("dullness",false)
                    .classed("brightnessfilter",false)
                    .style("background-image", "none")
                    .on("click",function(){});
            }
        
        }
    };
    
    return Records;
})();