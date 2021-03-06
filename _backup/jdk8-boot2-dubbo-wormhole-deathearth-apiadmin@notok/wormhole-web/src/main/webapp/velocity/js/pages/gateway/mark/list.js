define([ 'jquery', 'lodash', 'tabhelper', 'moment', 'utils/utils', 'utils/pagination' ], 
	function($, _, tabHelper, moment, utils, Pagination) {
	
	var listRenderSelect = _.template($('#selectOneTmpl').html());
	var $listSelect = $('[role=rootId]');
	var loadingSelect = function(page) {
		$.ajax({
			type : 'get',
            dataType : 'json',
			url : '/gateway/mark/proto/select/level/one',
		}).done(function(result) {
			if (result.status === 'ok') {
				var markup = listRenderSelect({
					list : result.data
				})
				$listSelect.html(markup)
			} else {
				alert(result.data)
			}
		}).fail(function(resp, msg, err) {
			alert(msg)
		})
	}
	loadingSelect();
	
	
	var listRender = _.template($('#listTmpl').html())
	var $list = $('[role=list]')
	var $search = $('[role=search]')
	var loading = function(page) {
		var query = utils.serializeJson($search)
		query.pageIndex = page
		query.pageSize = pager.pageSize

		$.ajax({
			type : 'get',
            dataType : 'json',
			url : '/gateway/mark/proto/index',
			data: query,
		}).done(function(result) {
			if (result.status === 'ok') {
				var markup = listRender({
					list : result.data,
					offset: (page - 1)*pager.pageSize,
					moment : moment
				})
				$("#msg").text(result.msg)
				$list.html(markup)
				pager.set(page, result.itemsCount)
			} else {
				alert(result.data)
			}
		}).fail(function(resp, msg, err) {
			alert(msg)
		})
	}
	//初始化分页控件
	var pager = new Pagination({ el: $('.page-box'), loader: loading })
	//首次載入初始化
	pager.goto(1);
	
	tabHelper.onChildClose(function(result) {
		if (result.data == true) {
			pager.reload()
		}
	})
  
	$search.on('submit', function () {
		pager.goto(1)
		return false
	})

	$('[role=add]').on('click', function() {
		tabHelper.openChildTab('/gateway/mark/add')
	})

	//跳转到编辑页面
	$list.on('click', '[role=edit]', function () {
		var id = $(this).data('id')
		tabHelper.openChildTab('/gateway/mark/edit?id=' + id)
	})
	
	//删除操作
	$list.on('click', '[role=delete]', function() {
		var ok = confirm('确认删除吗?')
		if (ok) {
			var id = $(this).data('id')
			$.ajax({
				type : 'get',
				dataType : 'json',
				url : '/gateway/mark/delete?id='+id,
			}).done(function(result) {
				if (result.jsonResp.status === 'ok') {
					alert("删除成功!!!");
					pager.reload()
				} else {
					alert(result.jsonResp.data)
				}
			}).fail(function(resp, msg, err) {
				alert(msg)
			})
		}
	})
	
	
	
	
	$('[role=rootId]').on('change', function() {
    	var html = "<option value='' selected>全部</option>";
    	var val = this.value;
    	$.ajax({
			type : 'get',
            dataType : 'json',
			url : '/gateway/mark/proto/select/level/two',
			data: {"rootId":val},
		}).done(function(result) {
			if (result.status === 'ok') {
				var data = result.data;
				for(var i = 0;i<data.length;i++){
					html += "<option value='"+data[i].id+"'>"+data[i].name+"</option>";
				}
				$("#branchId").html(html);
				pager.goto(1);
			}else{
				$("#branchId").html(html);
			}
		});
    })
    
    $('[role=branchId]').on('change', function() {
    	var html = "<option value='' selected>全部</option>";
    	var rootId = $("#rootId option:selected").val();
    	var val = this.value;
    	$.ajax({
			type : 'get',
            dataType : 'json',
			url : '/gateway/mark/proto/select/level/three',
			data: {"rootId":rootId,"branchId":val},
		}).done(function(result) {
			if (result.status === 'ok') {
				var data = result.data;
				for(var i = 0;i<data.length;i++){
					html += "<option value='"+data[i].id+"'>"+data[i].name+"</option>";
				}
				$("#leafId").html(html);
				pager.goto(1);
			}else{
				$("#leafId").html(html);
			}
		});
    })

})