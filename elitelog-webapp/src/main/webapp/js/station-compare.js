var selectedStationList = [];
var stationTypeAhead;
var stationDataTable;

var getStationList = function() {
    $.ajax({
        type: "POST",
        url: "/api/stations/distinct"
    }).done(function(data) {
        stationList = data.stations;
        initialiseStationTypeAhead($('#stations-typeahead'));
        
    });
}

$(document).ready(function() {
    
    getStationList();
    
    $('#station-refresh-btn').on('click', function() {
        console.log("Refresh pressed");
        console.log(stationList);
        getStationList();
    });
    
    // Register the display of the help modal to the help div
	$('#help-icon').on('click', function() {
		console.log("Help button pressed");
		$('#helpModal').modal()
	});
	
	$('#station-update-btn').on('click', function() {
		var selectedStationList = [];
		selectedObjects = stationTypeAhead.getSelection();
		for(i=0; i < selectedObjects.length; i++) {
			selectedStationList.push(selectedObjects[i].name);
		}
		console.log("StationList: " + selectedStationList);
		
		updateTable(selectedStationList);
	});
});

var initialiseStationTypeAhead = function() {
    
    maxSelection = null;
    stationTypeAhead = $('#stations-typeahead').magicSuggest({
       data: stationList,
       highlight: false,
       allowFreeEntries: false,
       maxSelection: maxSelection,
       useTabKey: true,
    });
    if (stationTypeAhead.getSelection().length == 0 && stationList.length <= maxSelection) {
        stationTypeAhead.setSelection(stationTypeAhead.getData());
    }
}

function updateTable(stationList) {
	
	if (stationDataTable != undefined) {
		console.log("Table already initialised, destroying...");
		stationDataTable.fnDestroy();
	}
	
	console.log("2StationList: " + stationList)
	
	generateTableHtml(stationList);
	
	dataTableConfig = buildDataTablesConfig(stationList);
	
	console.log(dataTableConfig);
	
	
	
	stationDataTable=$('#data-table').dataTable(dataTableConfig);
	
//	$.ajax({
//        type: "POST",
//        url: "/api/commodities/stationPricePerCommodity"
//    }).done(function(data) {
//        generateTable(stationList, data);
//    });
};

function generateTableHtml(stationList) {
	
	$('#data-table').empty();
	
	
	
	// Generate headers
	header = '<thead><tr><th rowspan=2>Commodity</th>';
	
	for(i = 0; i< stationList.length; i++ ) {
		var stationClass;
		if (i % 2 == 0) {
			stationClass = "station-even";
		} else {
			stationClass = "station-odd";
		}
		header += "<th colspan='4' class='" + stationClass + "' >" + stationList[i] + "</th>";
	}
	header += '</tr><tr>'
	
	for(i=0; i < stationList.length; i++) {
		header += "<th>Buy</th><th>Supply Level</th><th>Sell</th><th>Demand Level</th>"
	}
	header += '</tr></thead>'
	
	body = "<tbody></tbody>"
	
	
	table = header + body;
	$('#data-table').append(table);
	$('#data-table').removeAttr('hidden');
	
};

function buildDataTablesConfig(stationList) {
	var retVal = {};
	
	retVal["sDom"] = '<"row"<"col-sm-6"l><"col-sm-6"C>><"row"<"col-sm-12"t>><"row"<"col-sm-6"i><"col-sm-6"p>>';
	retVal["sAjaxSource"] = "/api/commodities/pricePerStation";
	retVal["sAjaxDataProp"] = "_embedded.commodityDetails";
	
	colArray = []
	
	// First column is the commoditiy name (in _id field)

	colArray.push({mDataProp:'_id'});
	
	// Then for each station the columns are:
	// Buy	Supply Level	Sell	Demand Level
	
	for(var i in stationList) {
		
		var stationClass;
		if (i % 2 == 0) {
			stationClass = "station-even";
		} else {
			stationClass = "station-odd";
		}
		
		console.log("Index: " + i);
		station = stationList[i];
		colArray.push({
			mDataProp:'value.'+station+'.buy',
			// For the buy column we only want to show value if not zero
			mRender: function(data, type, full) {
				if (data == 0) {
					return "";
				} else {
					return data;
				}
			},
			defaultContent:'',
			sClass: stationClass
		});
		colArray.push({
			mDataProp:'value.'+station+'.supplyLevel',
			defaultContent:'',
			sClass: stationClass
		});
		colArray.push({
			mDataProp:'value.'+station+'.sell',
			defaultContent:'',
			sClass: stationClass
		});
		colArray.push({
			mDataProp:'value.'+station+'.demandLevel',
			defaultContent:'',
			sClass: stationClass
		});
		
		
	}
	
	retVal["aoColumns"] = colArray;
	
	retVal["scrollX"] = true;
	return retVal;
		
}