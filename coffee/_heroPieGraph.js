var HeroPieGraph;

HeroPieGraph = (function() {
    function HeroPieGraph() {
        this.bb_hero_pie = {
            w: 300,
            h: 300,
            margin: {
                top: 20,
                right: 20,
                bottom: 20,
                left: 20
            }
        };
        this.data = {};
    }

    // Stash the old values for transition.
    function stash(d) {
        d.x0 = d.x;
        d.dx0 = d.dx;
    }

    function capitalizeFirstLetter(string)
    {
        return string.charAt(0).toUpperCase() + string.slice(1);
    }

    function findLargest3(array1){
        // sort descending
        array1.sort(function(a,b) {
            if (a[1] < b[1]) { return 1; }
            else if (a[1] == b[1]) { return 0; }
            else { return -1; }
        });

        return array1.slice(0,3);
    }

    function sorting(a, b)
    {
        return a.dname.localeCompare(b.dname);
    }

    function highlight()
    {
        if (!this.classList.contains("selected"))
        {
            d3.select(this).attr("class", "pic selected brightnessfilter")
                .style("border", "2px solid red");
        }
        else
        {
            $(this).removeClass("selected");
            d3.select(this).style("border", "2px solid black");
        }
    }

    // update the hero_flare to contain the counts for `data`
    HeroPieGraph.prototype.update_flare = function (data) {
        var self = this;
        var j, i;
        // heroes
        // zero counts
        for (i = 0; i < self.hero_flare.children.length; i++) {
            for (j = 0; j < self.hero_flare.children[i].children.length; j++) {
                self.hero_flare.children[i].children[j].games_played = 0;
                self.hero_flare.children[i].children[j].games_won = 0;
                self.hero_flare.children[i].children[j].items = [];
                //for (var k = 0; k < self.hero_flare.children[i].children[j].items.length; k++) {
                //    self.hero_flare.children[i].children[j].items[k].number = 0;
                //}
            }
        }

        data.matches.forEach(function(d,i) {

            var current_hero = ViewUtils.getHeroInfo(constants, d.player_info.hero_id);

            // find which child array holds the heroes for this stat
            if(current_hero) {
                var children_pos = self.hero_flare.children.map(function (d) {
                    return d.name;
                }).indexOf(current_hero.stat);
                var cur = self.hero_flare.children[children_pos].children;

                // find which element of that array holds this hero
                var hero_pos = cur.map(function (d) {
                    return d.dname;
                }).indexOf(current_hero.dname);
                cur[hero_pos].games_played += 1;
                if (d.player_win) cur[hero_pos].games_won += 1;
            }
        });

        //deep copy attempts
        //item_flare = jQuery.extend(true, {}, self.hero_flare);
        //item_flare = JSON.parse(JSON.stringify(self.hero_flare));

        //get items to each hero and enumerate a count
        var map = function(d) {return d.name;};
        var dmap = function(d) {return d.dname;};
        for (i = 0; i < data.matches.length; i++) {

            if (data.matches[i].players.length == 5) {
                continue;
            }
            
            for (j = 0; j < 6; j++) {

                var current_item = ViewUtils.getItemInfoCopy(constants, data.matches[i].player_info["item_"+j]);

                if (current_item.dname == "empty") {
                    continue;
                }
                var current_hero = ViewUtils.getHeroInfo(constants, data.matches[i].player_info.hero_id);

                // find which child array holds the heroes for this stat
                var children_pos = self.hero_flare.children.map(map).indexOf(current_hero.stat);
                var cur = self.hero_flare.children[children_pos].children;

                // find which element of that array holds this hero
                var hero_pos = cur.map(dmap).indexOf(current_hero.dname);

                if (!("items" in cur[hero_pos])) {
                    cur[hero_pos].items = [];
                }

                var item_pos = cur[hero_pos].items.map(dmap).indexOf(current_item.dname);
                
                if (item_pos == -1) {
                    current_item.number = 1;
                    cur[hero_pos].items.push(current_item);
                }
                else {
                    cur[hero_pos].items[item_pos].number += 1;
                }
            }

        }

        return self.hero_flare;
    };
    
    HeroPieGraph.prototype.init = function() {
        var self = this;
        self.data.matches = matches;
        self.data.id32 = player.account_id;
        self.data.id64 = player.steamid;
        self.data.user = player.personaname;
        constants.item_ids["0"] = "empty";
        constants.items.empty = {dname: "empty", id: 0, img: "", name: "empty"};
        self.initFlare();
        var svg_hero_pie = d3.select("#hero_pie_container").append("svg").attr({
            width: self.bb_hero_pie.w + self.bb_hero_pie.margin.left + self.bb_hero_pie.margin.right,
            height: self.bb_hero_pie.h + self.bb_hero_pie.margin.bottom + self.bb_hero_pie.margin.top
        });
        self.hero_pie_graph = svg_hero_pie.append("g")
            .attr("class", "hero_pie")
            .attr("transform", "translate(" + (self.bb_hero_pie.w/2 + self.bb_hero_pie.margin.left) + "," + (self.bb_hero_pie.h / 2 + self.bb_hero_pie.margin.top) + ")");
        self.hero_pie(self.update_flare(self.data));
    };
    
    HeroPieGraph.prototype.initFlare = function() {
        var self = this;
        var hero;
        var hero_keys = Object.keys(constants.heroes);
        var intheroes = [];
        var agiheroes = [];
        var strheroes = [];
        for (var i = 0; i < hero_keys.length; i++)
        {
            hero = ViewUtils.getHeroInfoCopy(constants, hero_keys[i]);
            if (hero)
            {
                if (hero.stat == "strength")
                {
                    strheroes.push(hero);
                }
                else if (hero.stat == "agility")
                {
                    agiheroes.push(hero);
                }
                else if (hero.stat == "intelligence")
                {
                    intheroes.push(hero);
                }
            }
        }
        strheroes.sort(sorting);
        agiheroes.sort(sorting);
        intheroes.sort(sorting);
        strheroes.forEach(function (d)
        {
            var heroname = d.name;
            d3.select("#strimages").append("img").attr("id", heroname).attr("class", "pic brightnessfilter");
            d3.select("#strimages").select("#" + heroname).attr('src', d.img).attr("width", "80px").attr("value", d.id);
            d3.select("#strimages").select("#" + heroname).on("click", highlight);
        });
        agiheroes.forEach(function (d)
        {
            var heroname = d.name;
            d3.select("#agiimages").append("img").attr("id", heroname).attr("class", "pic brightnessfilter");
            d3.select("#agiimages").select("#" + heroname).attr('src', d.img).attr("width", "80px").attr("value", d.id);
            d3.select("#agiimages").select("#" + heroname).on("click", highlight);
        });
        intheroes.forEach(function (d)
        {
            var heroname = d.name;
            d3.select("#intimages").append("img").attr("id", heroname).attr("class", "pic brightnessfilter");
            d3.select("#intimages").select("#" + heroname).attr('src', d.img).attr("width", "80px").attr("value", d.id);
            d3.select("#intimages").select("#" + heroname).on("click", highlight);
        });
        // creates sunburst parent-child nested array-dict object whatever format
        //for use in the hero sunburst, although without any data
        self.hero_flare = {};

        self.hero_flare.name = "flare";
        self.hero_flare.children = [{},{},{}];

        self.hero_flare.children[0].name = "agility";
        self.hero_flare.children[1].name = "strength";
        self.hero_flare.children[2].name = "intelligence";

        self.hero_flare.children[0].children = [];
        self.hero_flare.children[1].children = [];
        self.hero_flare.children[2].children = [];

        for (i = 0; i < hero_keys.length; i++)
        {
            hero = ViewUtils.getHeroInfoCopy(constants, hero_keys[i]);

            hero.items = [];

            if (hero.stat == "agility") {
                self.hero_flare.children[0].children.push(hero);
            }

            if (hero.stat == "strength") {
                self.hero_flare.children[1].children.push(hero);
            }

            if (hero.stat == "intelligence") {
                self.hero_flare.children[2].children.push(hero);
            }


        }
    };

    //creates hero sunburst graph based on hero flare json data
    HeroPieGraph.prototype.hero_pie = function (flare) {
        var self = this;
        var max_item_array;
        //tool tip setup
        var graph_tip = d3.tip()
            .attr("class", "d3-tip")
            .offset([0,0]);
        self.hero_pie_graph.call(graph_tip);

        for (var i = 0; i < self.hero_flare.children.length; i++) {

            for (var j = 0; j < self.hero_flare.children[i].children.length; j++) {

                var current_children = self.hero_flare.children[i].children[j];

                if ("items" in current_children) {
                    
                    max_item_array = [];

                    for (var k = 0; k < self.hero_flare.children[i].children[j].items.length; k ++) {

                        var current_item = self.hero_flare.children[i].children[j].items[k];

                        max_item_array.push([current_item.dname, current_item.number]);

                    }

                }

                self.hero_flare.children[i].children[j].item_max = findLargest3(max_item_array);

            }
        }

        var hero_pie_radius = Math.min(self.bb_hero_pie.w, self.bb_hero_pie.h) / 2;

        var hero_pie_color = d3.scale.ordinal()
            .domain(["flare","agility", "strength", "intelligence"])
            //get them to be the correct dota colors
            .range(["white", "#2BAC00", "#E38800","#1A88FC"]);
        //.range(["white","#167c13", "#b9500b", "#257dae"]);

        var hero_pie_x = d3.scale.linear()
            .range([0, 2 * Math.PI]);

        var hero_pie_y = d3.scale.sqrt()
            .range([0, hero_pie_radius]);

        var partition = d3.layout.partition()
            .value(function(d) { return d.games_played; });

        var zero_arc = d3.svg.arc()
            .startAngle(0)
            .endAngle(0)
            .innerRadius(function(d) { return Math.max(0, hero_pie_y(d.y)); })
            .outerRadius(function(d) { return Math.max(0, hero_pie_y(d.y + d.dy)); });

        var hero_pie_arc = d3.svg.arc()
            .startAngle(function(d) { return Math.max(0, Math.min(2 * Math.PI, hero_pie_x(d.x))); })
            .endAngle(function(d) { return Math.max(0, Math.min(2 * Math.PI, hero_pie_x(d.x + d.dx))); })
            .innerRadius(function(d) { return Math.max(0, hero_pie_y(d.y)); })
            .outerRadius(function(d) { return Math.max(0, hero_pie_y(d.y + d.dy)); });

        var hero_pie_path = self.hero_pie_graph.selectAll("path")
            .data(partition.nodes(flare), function (d) { return d.name; });

        // Interpolate the scales!
        var clickArcTween = function (d) {
            var xd = d3.interpolate(hero_pie_x.domain(), [d.x, d.x + d.dx]),
                yd = d3.interpolate(hero_pie_y.domain(), [d.y, 1]),
                yr = d3.interpolate(hero_pie_y.range(), [d.y ? 20 : 0, hero_pie_radius]);
            return function(d, i) {
                return i ? function(t) { return hero_pie_arc(d); } : function(t) { hero_pie_x.domain(xd(t)); hero_pie_y.domain(yd(t)).range(yr(t)); return hero_pie_arc(d); };
            };
        };
        
        var click = function (d) {
            hero_pie_path.transition()
                .duration(750)
                .attrTween("d", clickArcTween(d));
        };

        // Interpolate the arcs in data space.
        var heroPieArcTween = function (a) {
            var i = d3.interpolate({x: a.x0, dx: a.dx0}, a);
            return function(t) {
                var b = i(t);
                a.x0 = b.x;
                a.dx0 = b.dx;
                return hero_pie_arc(b);
            };
        };

        hero_pie_path
            .enter().append("path")
            .attr("class", "hero_pie")
            .attr("d", zero_arc)
            .on("click", click)
            .on("mouseover", function(d) {

                var tooltip = true;

                var name;
                var number_text;

                if (d.value == 1) {
                    number_text = " game";
                }
                else {
                    number_text = " games";
                }

                if ("dname" in d) {
                    name = d.dname;
                }
                else if (d.name == "flare") {
                    tooltip = false;
                }
                else {
                    name = capitalizeFirstLetter(d.name) + " Heroes";
                }

                var basic_tip = "<div id='tooltip_text'><strong>"+ name +"</strong>"+ "<br>" + d.value + number_text + "</br></div>";

                if ("item_max" in d) {

                    //if buy less than three items, you noob or maybe doob. No item array for you!
                    if (d.item_max.length < 3) {
                        basic_tip = "<div id='tooltip_text'><strong>"+ name +"</strong>"+ "<br>" + d.value + number_text + "</br></div>";
                    }

                    else {

                        var item_text1, item_text2, item_text3;

                        //look i has a ternary
                        item_text1 = (d.item_max[0][1] == 1) ? "time" : "times";
                        item_text2 = (d.item_max[1][1] == 1) ? "time" : "times";
                        item_text3 = (d.item_max[2][1] == 1) ? "time" : "times";

                        basic_tip = "<div id='tooltip_text'><strong>"+ name +"</strong>"+ "<br>" + d.value + number_text + " (winrate: " + (d.games_won/ d.games_played*100).toFixed(2) + "%)</br>" + "<br><strong>Most bought items: </strong><br>" + d.item_max[0][0] + ", " + d.item_max[0][1] + " " + item_text1 + "<br>" + d.item_max[1][0] + ", " + d.item_max[1][1] + " " + item_text2 + "<br>" + d.item_max[2][0] + ", " + d.item_max[2][1] + " " + item_text3 + "</br></div>";
                    }
                }
                var img_tip;
                if ("dname" in d) {
                    img_tip = "<div id='hero_sunburst_tip'><img src='" + d.img + "'' width='64px' height='36px'></div>";
                }
                else {
                    img_tip = "";
                }
                
                graph_tip.html(img_tip + basic_tip);

                if (tooltip) {
                    graph_tip.direction('e');
                    graph_tip.show(d);
                }

                d3.select(this)
                    .style("fill", "aquamarine");
            })
            .on("mouseout", function(d) {
                graph_tip.hide(d);
                graph_tip.direction('n');

                d3.select(this)
                    .style("fill", function(d) { return hero_pie_color((d.children ? d : d.parent).name); });
            })
            .each(stash); // store the initial angles  

        hero_pie_path
            .style("fill", "white")
            .transition()
            .duration(1000)
            .attrTween("d", heroPieArcTween)
            .style("fill", function(d) {
                return hero_pie_color((d.children ? d : d.parent).name); });
    };
    
    return HeroPieGraph;
})();