var ViewUtils;

ViewUtils = (function() {
    function ViewUtils() {}

    function idToItemInfo(constants, id) {
        var itemData = constants.item_ids;
        if (id in itemData)
            return constants.items[itemData[id]];
        else
            logger.debug("No item with id " + id);
    }

    ViewUtils.getItemInfoCopy = function(constants, id) {
        var object =  idToItemInfo(constants, id);
        return jQuery.extend(true, {}, object);
    };

    function idToHeroInfo(constants, id) {
        var heroData = constants.heroes;
        if (id in heroData)
            return heroData[id];
        else
            logger.debug("No hero with id " + id);
    }
    
    ViewUtils.getHeroInfo = function(constants, id) {
        return idToHeroInfo(constants, id);
    };
    
    ViewUtils.getHeroInfoCopy = function(constants, id) {
        var object = idToHeroInfo(constants, id);
        return jQuery.extend(true, {}, object);
    };

    ViewUtils.format = function(input) {
        input = Number(input);
        if(input === 0) return "-";
        return(Math.abs(input) < 1000 ? ~~(input) : numeral(input).format('0.0a'));
    };
    
    ViewUtils.setProgress = function(percent) {
        $('.progress-bar').css('width', percent + '%');
        $('.progress-bar').prop('aria-valuenow', percent);
        $('.progress-bar').text(percent + '%');
    };

    ViewUtils.pad = function(n, width, z) {
        z = z || '0';
        n = n + '';
        return n.length >= width ? n : new Array(width - n.length + 1).join(z) + n;
    };

    ViewUtils.getSignedNumber = function(theNumber)
    {
        if(theNumber > 0) return "+" + theNumber;
        return theNumber.toString();
    };

    ViewUtils.formatSeconds = function(input) {
        var absTime = Math.abs(input);
        var minutes = ~~ (absTime / 60);
        var seconds = ViewUtils.pad(absTime % 60, 2);
        var time = ((input < 0) ? "-" : "");
        time += minutes + ":" + seconds;
        return time;
    };

    ViewUtils.momentTime = function(input) {
        return moment().startOf('day').seconds(input);
    };
    
    ViewUtils.init = function() {
        $('table.summable').each(function(i, table) {
            //iterate through rows
            var sums = {
                Radiant: {},
                Dire: {}
            };
            var tbody = $(table).find('tbody');
            tbody.children().each(function(i, row) {
                row = $(row);
                var target = (row.hasClass('success')) ? sums.Radiant : sums.Dire;
                //iterate through cells
                row.children().each(function(j, cell) {
                    cell = $(cell);
                    if(!target[j]) target[j] = 0;
                    var content = cell.clone() //clone the element
                        .children() //select all the children
                        .remove() //remove all the children
                        .end() //again go back to selected element
                        .text();
                    target[j] += Number(content) || 0;
                });
            });
            //add sums to table
            var tfoot = $("<tfoot>");
            for(var key in sums) {
                var tr = $("<tr>");
                var sum = sums[key];
                sum["0"] = key;
                for(var index in sum) {
                    var td = $("<td>");
                    if(index != "0") td.addClass('format');
                    td.text(sum[index]);
                    tr.append(td);
                }
                tfoot.append(tr);
            }
            $(table).append(tfoot);
        });
        $('.format').each(function() {
            $(this).text(ViewUtils.format($(this).text()));
        });
        $('.format-seconds').each(function() {
            $(this).text(ViewUtils.formatSeconds($(this).text()));
        });
        $('#matches').dataTable({
            "order": [
                [0, "desc"]
            ],
            "columnDefs": [{
                "targets": [1],
                "orderData": [2]
            }, {
                "targets": [2],
                "visible": false
            }]
        });
        $('#teammates').dataTable({
            "order": [
                [1, "desc"]
            ]
        });
        $('#heroes').dataTable({
            "order": [
                [2, "desc"]
            ],
            "columnDefs": [{
                "targets": [0],
                "orderData": [1]
            }, {
                "targets": [1],
                "visible": false
            }]
        });
        $('.item').qtip({
            content: {
                text: function(event, api) {
                    var item_name = $(this).attr('alt');
                    db.constants.findOne({}, function(err, constants) {
                        if(err) {
                            api.set('content.text', "Error");
                            return logger.error(err);
                        }
                        var data = constants.items[item_name];
                        var html = "";
                        html += data.cost + "<br>";
                        html += data.desc + "<br>";
                        html += data.notes + "<br>";
                        html += data.attrib + "<br>";
                        html += data.mc + data.cd + "<br>";
                        html += data.lore + "<br>";
                        // Set the tooltip content upon successful retrieval
                        api.set('content.text', html);
                        api.set('content.title', data.dname);
                    });
                    return 'Loading...'; // Set some initial text
                }
            }
        });
        $('.ability').qtip({
            content: {
                text: function(event, api) {
                    var ability_name = $(this).attr('alt');
                    db.constants.findOne({}, function(err, constants) {
                        if(err) {
                            api.set('content.text', "Error");
                            return logger.error(err);
                        }
                        var data = constants.abilities[ability_name];
                        var html = " ";
                        if(data.affects) html = data.affects + "<br>";
                        if(data.desc) html += data.desc + "<br>";
                        if(data.notes) html += data.notes + "<br>";
                        if(data.attrib) html += data.attrib + "<br>";
                        if(data.dmg) html += data.dmg + "<br>";
                        if(data.cmb) html += data.cmb + "<br>";
                        if(data.lore) html += data.lore + "<br>";
                        // Set the tooltip content upon successful retrieval
                        api.set('content.text', html);
                        api.set('content.title', data.dname);
                    });
                    return 'Loading...'; // Set some initial text
                }
            }
        });
        var buildingData = [{
            id: "t4tr",
            style: "position: absolute; top: 77%; left: 15%;"
        }, {
            id: "t4br",
            style: "position: absolute; top: 78%; left: 17%;"
        }, {
            id: "t3br",
            style: "position: absolute; top: 86%; left: 26%;"
        }, {
            id: "t2br",
            style: "position: absolute; top: 86%; left: 45%;"
        }, {
            id: "t1br",
            style: "position: absolute; top: 86%; left: 80%;"
        }, {
            id: "t3mr",
            style: "position: absolute; top: 72%; left: 22%;"
        }, {
            id: "t2mr",
            style: "position: absolute; top: 64%; left: 29%;"
        }, {
            id: "t1mr",
            style: "position: absolute; top: 57%; left: 40%;"
        }, {
            id: "t3tr",
            style: "position: absolute; top: 67%; left: 9%;"
        }, {
            id: "t2tr",
            style: "position: absolute; top: 53%; left: 11%;"
        }, {
            id: "t1tr",
            style: "position: absolute; top: 38%; left: 11%;"
        }, {
            id: "brbr",
            style: "position: absolute; top: 85%; left: 24%;"
        }, {
            id: "bmbr",
            style: "position: absolute; top: 87%; left: 24%;"
        }, {
            id: "brmr",
            style: "position: absolute; top: 73%; left: 18%;"
        }, {
            id: "bmmr",
            style: "position: absolute; top: 74%; left: 20%;"
        }, {
            id: "brtr",
            style: "position: absolute; top: 69%; left: 8%;"
        }, {
            id: "bmtr",
            style: "position: absolute; top: 69%; left: 10%;"
        }, {
            id: "t4td",
            style: "position: absolute; top: 18%; left: 81%;"
        }, {
            id: "t4bd",
            style: "position: absolute; top: 19%; left: 83%;"
        }, {
            id: "t3bd",
            style: "position: absolute; top: 31%; left: 87%;"
        }, {
            id: "t2bd",
            style: "position: absolute; top: 47%; left: 88%;"
        }, {
            id: "t1bd",
            style: "position: absolute; top: 59%; left: 87%;"
        }, {
            id: "t3md",
            style: "position: absolute; top: 27%; left: 73%;"
        }, {
            id: "t2md",
            style: "position: absolute; top: 34%; left: 65%;"
        }, {
            id: "t1md",
            style: "position: absolute; top: 47%; left: 56%;"
        }, {
            id: "t3td",
            style: "position: absolute; top: 13%; left: 70%;"
        }, {
            id: "t2td",
            style: "position: absolute; top: 12%; left: 48%;"
        }, {
            id: "t1td",
            style: "position: absolute; top: 12%; left: 18%;"
        }, {
            id: "brbd",
            style: "position: absolute; top: 29%; left: 86%;"
        }, {
            id: "bmbd",
            style: "position: absolute; top: 29%; left: 88%;"
        }, {
            id: "brmd",
            style: "position: absolute; top: 25%; left: 74%;"
        }, {
            id: "bmmd",
            style: "position: absolute; top: 26%; left: 76%;"
        }, {
            id: "brtd",
            style: "position: absolute; top: 12%; left: 72%;"
        }, {
            id: "bmtd",
            style: "position: absolute; top: 14%; left: 72%;"
        }, {
            id: "ar",
            style: "position: absolute; top: 79%; left: 12%;"
        }, {
            id: "ad",
            style: "position: absolute; top: 14%; left: 83%;"
        }];
        var bits = ViewUtils.pad(Number($('#map').attr('data-tower-radiant')).toString(2), 11);
        bits += ViewUtils.pad(Number($('#map').attr('data-barracks-radiant')).toString(2), 6);
        bits += ViewUtils.pad(Number($('#map').attr('data-tower-dire')).toString(2), 11);
        bits += ViewUtils.pad(Number($('#map').attr('data-barracks-dire')).toString(2), 6);
        bits += $('#map').attr('data-radiant-win') === "1" ? "10" : "01";
        logger.debug(bits);

        //concat, iterate through bits of all four status values
        //if 1, create image
        //building data in correct order
        //determine ancient display by match winner
        for(var i = 0; i < bits.length; i++) {
            var d = buildingData[i];
            d.src = 'images/';
            d.src += buildingData[i].id.slice(0, 1) === "t" ? 'tower' : 'racks';
            d.src += buildingData[i].id.slice(-1) === "r" ? '_radiant.png' : '_dire.png';
            d.class = buildingData[i].id.slice(0, 1) === "a" ? "" : "icon";
            d.style += bits[i] === "1" ? "" : "-webkit-filter: grayscale(100%);";
            $('#map').append(($('<img>', d)));
        }
    };
    
    return ViewUtils;
})();