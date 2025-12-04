function ordenarPorFecha() {
  var hoja = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Agenda Cx");
  var rango = hoja.getRange(3, 1, hoja.getLastRow() - 3, 28);
  rango.sort({column: 1, ascending: true});
}