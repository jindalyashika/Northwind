sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageToast"
], function (Controller, JSONModel, MessageToast) {
    "use strict";

    return Controller.extend("project1.controller.ProductDetail", {

        onInit: function () {
            this.getOwnerComponent().getRouter()
                .getRoute("RouteProductDetail")
                .attachPatternMatched(this._onProductMatched, this);
        },

        _onProductMatched: function (oEvent) {
            this._sProductId = oEvent.getParameter("arguments").productId;
            var sPath = "/Products(" + this._sProductId + ")";
            this.getView().bindElement({
                path: sPath
            });
        },

        onNavBack: function () {
            this.getOwnerComponent().getRouter().navTo("RouteView1");
        },

       onEditProduct: function () {
    if (!this._pEditDialog) {
        this._pEditDialog = this.loadFragment({
            name: "project1.view.CreateProduct"
        });
    }

    this._pEditDialog.then(function (oDialog) {
        var oContext = this.getView().getBindingContext();
        var oCurrentData = oContext.getObject();

        var oEditProductModel = new JSONModel({
            ProductName: oCurrentData.ProductName,
            SupplierID: oCurrentData.SupplierID,
            CategoryID: oCurrentData.CategoryID,
            QuantityPerUnit: oCurrentData.QuantityPerUnit,
            UnitPrice: oCurrentData.UnitPrice,
            UnitsInStock: oCurrentData.UnitsInStock,
            UnitsOnOrder: oCurrentData.UnitsOnOrder,
            ReorderLevel: oCurrentData.ReorderLevel,
            Discontinued: oCurrentData.Discontinued
        });

        this.getView().setModel(oEditProductModel, "newProduct");

        oDialog.setTitle("Edit Product");
        this.byId("saveProductButton").setText("Done");   // ✅ fix — Fragment.byId hataya

        oDialog.open();
    }.bind(this));
},
        onSaveProduct: function () {
            var oEditProductModel = this.getView().getModel("newProduct");
            var oRawData = oEditProductModel.getData();

            var oPayload = {
                ProductName: oRawData.ProductName,
                SupplierID: oRawData.SupplierID ? parseInt(oRawData.SupplierID, 10) : null,
                CategoryID: oRawData.CategoryID ? parseInt(oRawData.CategoryID, 10) : null,
                QuantityPerUnit: oRawData.QuantityPerUnit,
                UnitPrice: oRawData.UnitPrice ? parseFloat(oRawData.UnitPrice) : 0,
                UnitsInStock: oRawData.UnitsInStock ? parseInt(oRawData.UnitsInStock, 10) : 0,
                UnitsOnOrder: oRawData.UnitsOnOrder ? parseInt(oRawData.UnitsOnOrder, 10) : 0,
                ReorderLevel: oRawData.ReorderLevel ? parseInt(oRawData.ReorderLevel, 10) : 0,
                Discontinued: oRawData.Discontinued
            };

            var oODataModel = this.getView().getModel();
            var sPath = "/Products(" + this._sProductId + ")";

            oODataModel.update(sPath, oPayload, {
                success: function () {
                    MessageToast.show("Product updated successfully!");
                    this.byId("createProductDialog").close();
                }.bind(this),
                error: function (oError) {
                    MessageToast.show("Error updating product. Check console.");
                    console.error(oError);
                }
            });
        },

        onCancelProduct: function () {
            this.byId("createProductDialog").close();
        }
    });
});