/* eslint-disable */
/* This file is auto generated. Don't edit. */
define(function(){return ''
+'<!-- // Table的默认etpl 模板--> '
+' '
+'<!-- target: table --> '
+'<table id="${table | id}" class="${table | class}"> '
+'<colgroup id="${colgroup | id}"></colgroup> '
+'<thead id="${thead | id}" class="${thead | class}"></thead> '
+'<tbody id="${tbody | id}" class="${tbody | class}"></tbody> '
+'<tfoot id="${tfoot | id}" class="${tfoot | class}"></tfoot> '
+'</table> '
+' '
+'<!-- target: cover-table --> '
+'<!-- // 表头吸顶等情况下，定位absolute，固定定位的表头 --> '
+'<!-- if: ${fixHeadAtTop} --> '
+'<div id="${cover-table-wrapper | id}" class="${cover-table-wrapper | class}"> '
+'<!-- /if --> '
+'<table id="${cover-table | id}" '
+'class="${table | class} ${cover-table | class}" '
+'style="z-index: ${getCoverZIndex | call};" '
+'> '
+'<colgroup id="${cover-colgroup | id}""></colgroup> '
+'<thead id="${cover-thead | id}" class="${thead | class} ${cover-thead | class}"></thead> '
+'</table> '
+'<!-- if: ${fixHeadAtTop} --> '
+'</div> '
+'<!-- /if --> '
+' '
+'<!-- target: table-colgroup --> '
+'<!-- // 表格的colgroup，用来表达列宽 --> '
+'<!-- // @param fields 列对象数组 --> '
+'<!-- // @param fieldLength 列对象数组长度 --> '
+'<!-- for: ${fields} as ${field} --> '
+'<col class="${col | class}"></col> '
+'<!-- /for --> '
+' '
+'<!-- target: table-head --> '
+'<!-- // 处于表格 thead 内的表头行 --> '
+'<tr> '
+'<!-- for: ${realFields} as ${field}, ${columnIndex} --> '
+'<th class=" '
+'${hcell | class} '
+'<!-- if: ${field.sortable} --> '
+'${hcell-sort | class} '
+'<!-- /if --> '
+'<!-- if: ${field.field} === ${orderBy} --> '
+'<!-- if: ${order} === "asc" --> '
+'${hcell-asc | class} '
+'<!-- else --> '
+'${hcell-desc | class} '
+'<!-- /if --> '
+'<!-- /if --> '
+'<!-- if: ${field.tip} || ${field.tipOptions} --> '
+'${hcell-tip | class} '
+'<!-- /if --> '
+'<!-- if: !${field.align} --> '
+'<!-- elif: ${field.align} === "left" --> '
+'${hcell-align-left | class} '
+'<!-- elif: ${field.align} === "right" --> '
+'${hcell-align-right | class} '
+'<!-- elif: ${field.align} === "center" --> '
+'${hcell-align-center | class} '
+'<!-- else --> '
+'${hcell-align-justify | class} '
+'<!-- /if --> '
+'<!-- if: ${field.tdClassName} --> '
+'${field.tdClassName} '
+'<!-- /if --> '
+'"><!-- import: table-head-content --></th> '
+'<!-- /for --> '
+'</tr> '
+' '
+'<!-- target: table-head-content --> '
+'<!-- // 处于表格TH内的表头单元格内容 --> '
+'<!-- // @param field --> '
+'<!-- // @param columnIndex --> '
+'<!-- // @param order --> '
+'<!-- // @param orderBy --> '
+'<!-- // 最外面的wrapper本来不需要的，因为IE9 thead的position有bug，不得不 --> '
+'<!-- // 加一个wrapper专门来放position --> '
+'<div class="${hcell-wrapper | class}"> '
+'<div class="${hcell-text | class}"> '
+'${renderHeadTextContent | call(${field}, ${columnIndex})} '
+'</div> '
+'<div class="${hcell-extra | class}"> '
+'<!-- if: ${field.tip} || ${field.tipOptions} --> '
+'<div class="${hcell-htip | class}"><!-- import: table-head-tip --></div> '
+'<!-- /if --> '
+'<!-- if: ${field.sortable} --> '
+'<div class="${hcell-hsort | class}" data-column="${columnIndex}"></div> '
+'<!-- /if --> '
+'</div> '
+'</div> '
+' '
+'<!-- target: table-head-tip --> '
+'<!-- // 表头tip内容 --> '
+'<!-- // @param field --> '
+'<!-- // @param columnIndex --> '
+'<div class="${htip | class}" '
+'data-ui-type="Tip" '
+'data-ui-id="${getTipId | call(${field})}" '
+'<!-- if: ${field.tip} --> '
+'data-ui-content="${renderTipContent | call(${field}, ${columnIndex})}"> '
+'<!-- /if --> '
+'</div> '
+' '
+'<!-- target: table-sort --> '
+'<!-- // @param sortField --> '
+'<!-- // @param sortFieldLength --> '
+'<!-- // @param field --> '
+'<!-- // @param order --> '
+'<!-- // @param orderBy --> '
+'<!-- // @param realOrderBy --> '
+'<!-- if: ${sortFieldLength} --> '
+'<!-- for: ${sortField} as ${sfield}, ${index} --> '
+'<div class="${sort-item-wrapper | class}" '
+'data-order="asc" data-order-by="${field.field}" data-real-order-by="${sfield.field}"> '
+'<a class=" '
+'${sort-item | class} '
+'<!-- if: ${sfield.field} === ${realOrderBy} && ${order} === "asc" --> '
+'${sort-item-selected | class} '
+'<!-- /if --> '
+'">${sfield.name}${sfield.ascText} '
+'<span class="${sort-icon-asc | class}"></span> '
+'</a> '
+'</div> '
+'<div class=" '
+'${sort-item-wrapper | class} '
+'<!-- if: ${index} !== ${sortFieldLength} - 1 --> '
+'${sort-item-wrapper-with-border | class} '
+'<!-- /if --> '
+'" data-order="desc" data-order-by="${field.field}" data-real-order-by="${sfield.field}"> '
+'<a class=" '
+'${sort-item | class} '
+'<!-- if: ${sfield.field} === ${realOrderBy} && ${order} === "desc" --> '
+'${sort-item-selected | class} '
+'<!-- /if --> '
+'">${sfield.name}${sfield.descText} '
+'<span class="${sort-icon-desc | class}"></span> '
+'</a> '
+'</div> '
+'<!-- /for --> '
+'<!-- else --> '
+'<div class="${sort-item-wrapper | class}" data-order="asc" data-order-by="${field.field}"> '
+'<a class=" '
+'${sort-item | class} '
+'<!-- if: ${field.field} === ${orderBy} && ${order} === "asc" --> '
+'${sort-item-selected | class} '
+'<!-- /if --> '
+'">由低到高 '
+'<span class="${sort-icon-asc | class}"></span> '
+'</a> '
+'</div> '
+'<div class="${sort-item-wrapper | class}" data-order="desc" data-order-by="${field.field}"> '
+'<a class=" '
+'${sort-item | class} '
+'<!-- if: ${field.field} === ${orderBy} && ${order} === "desc" --> '
+'${sort-item-selected | class} '
+'<!-- /if --> '
+'">由高到低 '
+'<span class="${sort-icon-desc | class}"></span> '
+'</a> '
+'</div> '
+'<!-- /if --> '
+' '
+'<!-- target: table-select-all --> '
+'<!-- // 处于表格TH内的多选全选内容 --> '
+'<input type="checkbox" id="${select-all | id}" class="${select-all | class}" '
+'data-index="${index}" ${checked} ${disabled} /> '
+' '
+'<!-- target: table-select-multi --> '
+'<!-- // 处于表格体单元格TD内的多选内容 --> '
+'<input type="checkbox" id="${multi-select | append(${index}) | id}" '
+'class="${multi-select | class}" data-index="${index}" ${checked} ${disabled} /> '
+' '
+'<!-- target: table-select-single --> '
+'<!-- // 处于表格体单元格内的多选全选内容 --> '
+'<input type="radio" id="${single-select | append(${index}) | id}" '
+'name="${single-select | id}" '
+'class="${single-select | class}" data-index="${index}" '
+'${disabled} ${checked} /> '
+' '
+'<!-- target: table-body-ie --> '
+'<tbody id="${tbody | id}" class="${tbody | class}"> '
+'<!-- import: table-body --> '
+'</tbody> '
+' '
+'<!-- target: table-body --> '
+'<!-- // 处于表格tbody内的表格体的内容，将包含在 tbody 元素内 --> '
+'<!-- // @param datasource 数据源 --> '
+'<!-- // @param dataLength 数据源长度 --> '
+'<!-- // @param realFields 表格的fields定义 --> '
+'<!-- // @param fieldsLength 表格的fields长度 --> '
+'<!-- // @param order 当前排序方向 --> '
+'<!-- // @param orderBy 排序字段 --> '
+'<!-- // @param summaryFields 汇总行信息 --> '
+'<!-- if: ${dataLength} == 0 --> '
+'<!-- import: table-no-data --> '
+'<!-- else --> '
+'<!-- if: ${summaryFields} != null --> '
+'<tr class="${row | class} ${row-summary | class}"> '
+'<!-- for: ${realFields} as ${field}, ${columnIndex} --> '
+'<td class="${cell | class} '
+'<!-- if: ${field.field} === ${orderBy} --> '
+'${cell-sorted | class} '
+'<!-- /if --> '
+'<!-- if: !${field.align} --> '
+'<!-- elif: ${field.align} === "left" --> '
+'${cell-align-left | class} '
+'<!-- elif: ${field.align} === "right" --> '
+'${cell-align-right | class} '
+'<!-- elif: ${field.align} === "center" --> '
+'${cell-align-center | class} '
+'<!-- else --> '
+'${cell-align-justify | class} '
+'<!-- /if --> '
+'"> '
+'<!-- if: ${field.maxWidth} --> '
+'<div class="${cell-max-width | class}"> '
+'<!-- /if --> '
+'<!-- if: ${field.select} --> '
+'&nbsp; '
+'<!-- else --> '
+'<div class="${cell-text | class}"> '
+'${renderSummaryFieldsContent | call(${summaryFields}, ${field})} '
+'</div> '
+'<!-- /if --> '
+'<!-- if: ${field.maxWidth} --> '
+'</div> '
+'<!-- /if --> '
+'</td> '
+'<!-- /for --> '
+'</tr> '
+'<!-- /if --> '
+'<!-- for: ${datasource} as ${dataItem}, ${rowIndex} --> '
+'<tr class="${row | class}" data-row="${rowIndex}"> '
+'<!-- import: table-row-cells --> '
+'</tr> '
+'<!-- /for --> '
+'<!-- /if --> '
+' '
+'<!-- target: table-row-cells --> '
+'<!-- // 表格内一行的内容 --> '
+'<!-- // @param realFields 表格的fields定义 --> '
+'<!-- // @param fieldsLength 表格的fields长度 --> '
+'<!-- // @param rowIndex 当前行的index --> '
+'<!-- // @param dataItem 当前行的数据项 --> '
+'<!-- for: ${realFields} as ${field}, ${columnIndex} --> '
+'<!-- var: editable = ${isFieldEditable | call(${field}, ${rowIndex}, ${columnIndex})} --> '
+'<td class="${cell | class} '
+'<!-- if: ${field.field} === ${orderBy} --> '
+'${cell-sorted | class} '
+'<!-- /if --> '
+'<!-- if: !${field.align} --> '
+'<!-- elif: ${field.align} === "left" --> '
+'${cell-align-left | class} '
+'<!-- elif: ${field.align} === "right" --> '
+'${cell-align-right | class} '
+'<!-- elif: ${field.align} === "center" --> '
+'${cell-align-center | class} '
+'<!-- else --> '
+'${cell-align-justify | class} '
+'<!-- /if --> '
+'<!-- if: ${editable} === true --> '
+'${cell-editable | class} '
+'<!-- /if --> '
+'<!-- if: ${field.tdClassName} --> '
+'${field.tdClassName} '
+'<!-- /if --> '
+'" data-column="${columnIndex}"><!-- import: table-cell-content --></td> '
+'<!-- /for --> '
+' '
+'<!-- target: table-cell-content --> '
+'<!-- // 位于表格体TD内的单元格内容 --> '
+'<!-- // @param rowIndex 当前行的index --> '
+'<!-- // @param columnIndex 当前列的index --> '
+'<!-- // @param dataItem 当前行的数据集 --> '
+'<!-- // @param field 当前列的field对象 --> '
+'<!-- if: ${field.maxWidth} --> '
+'<div class="${cell-max-width | class}"> '
+'<!-- /if --> '
+'<div class=" '
+'${cell-text | class} '
+'"> '
+'${renderCellTextContent | call(${dataItem}, ${field}, ${rowIndex}, ${columnIndex})} '
+'<!-- if: ${editable} --> '
+'<div class="${cell-edit-entry | class}" '
+'<!-- if: ${field.editType} --> '
+'data-edit-type="${field.editType}" '
+'<!-- /if --> '
+'data-row="${rowIndex}" '
+'data-column="${columnIndex}"></div> '
+'<!-- /if --> '
+'</div> '
+'${renderCellExtraContent | call(${dataItem}, ${field}, ${rowIndex}, ${columnIndex})} '
+'<!-- if: ${field.maxWidth} --> '
+'</div> '
+'<!-- /if --> '
+' '
+'<!-- target: table-cell-extra --> '
+'<!-- // 位于表格体TD内的单元格附加内容 --> '
+'<div class=" '
+'${cell-extra | class} '
+'"> '
+'${content|raw} '
+'</div> '
+' '
+'<!-- target: table-edit-master --> '
+'<div class="${edit-control-wrapper | class}"> '
+'<!-- block: inputControls --><!-- /block --> '
+'</div> '
+'<div class="${edit-buttons-wrapper | class}"> '
+'<span data-ui-type="Button" '
+'data-ui-skin="ui-fc-important" '
+'data-ui-child-name="okButton" '
+'class="${edit-ok-button | class}">确定</span> '
+'<span data-ui-type="Button" '
+'data-ui-child-name="cancelButton" '
+'class="${edit-cancel-button | class}">取消</span> '
+'</div> '
+'<div class="${edit-validities-wrapper | class}"> '
+'<!-- block: validities --><!-- /block --> '
+'</div> '
+' '
+'<!-- target: table-edit-text(master = table-edit-master) --> '
+'<!-- block: inputControls --> '
+'<input data-ui-type="TextBox" data-ui-child-name="inputControl" /> '
+'<!-- /block --> '
+'<!-- block: validities --> '
+'<label data-ui-type="Validity" data-ui-child-name="inputControlValid"></label> '
+'<!-- /block --> '
+' '
+'<!-- target: table-foot --> '
+'<!-- // 绘制表尾 --> '
+'<!-- // @param footArray --> '
+'<!-- // @param footLength --> '
+'<tr class="${foot-row | class}"> '
+'<!-- for: ${footArray} as ${foot}, ${index} --> '
+'<td class=" '
+'${fcell | class} '
+'<!-- if: !${foot.align} --> '
+'<!-- elif: ${foot.align} === "left" --> '
+'${fcell-align-left | class} '
+'<!-- elif: ${foot.align} === "right" --> '
+'${fcell-align-right | class} '
+'<!-- elif: ${foot.align} === "center" --> '
+'${fcell-align-center | class} '
+'<!-- else --> '
+'${fcell-align-justify | class} '
+'<!-- /if --> '
+'" <!-- if: ${foot.colspan} --> '
+'colspan="${foot.colspan}" '
+'<!-- /if -->> '
+'<div class="${fcell-text | class}">${renderFootCellContent | call(${foot}, ${index})}</div> '
+'</td> '
+'<!-- /for --> '
+'</tr> '
+' '
+'<!-- target: table-no-data --> '
+'<!-- // 表格体不含有数据时候的内容 --> '
+'<tr> '
+'<td class="${no-data | class}" colspan="${fieldsLength}"> '
+'<div class="${no-data-message | class}"><span class="${no-data-icon | class}"></span>没有数据</div> '
+'</td> '
+'</tr> '
+' '
;});