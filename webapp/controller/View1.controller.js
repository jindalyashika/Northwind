sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/ui/model/Sorter",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageToast"
], function (Controller, Filter, FilterOperator, Sorter, JSONModel, MessageToast) {
    "use strict";

    return Controller.extend("project1.controller.View1", {

        onInit: function () {

        },

        onSearch: function (oEvent) {
            var sQuery = oEvent.getParameter("newValue");
            var oFilter = new Filter("ProductName", FilterOperator.Contains, sQuery);
            this.byId("productTable").getBinding("items").filter(sQuery ? [oFilter] : []);
        },

        onSort: function () {
            var oSorter = new Sorter("UnitPrice", false);
            this.byId("productTable").getBinding("items").sort(oSorter);
        },

        onProductPress: function (oEvent) {
            var oCtx = oEvent.getSource().getBindingContext();
            var sProductId = oCtx.getProperty("ProductID");
            this.getOwnerComponent().getRouter().navTo("RouteProductDetail", {
                productId: sProductId
            });
        },

        onAddProduct: function () {
            if (!this._pCreateDialog) {
                this._pCreateDialog = this.loadFragment({
                    name: "project1.view.CreateProduct"
                });
            }

            this._pCreateDialog.then(function (oDialog) {
                var oNewProductModel = new JSONModel({
                    ProductName: "",
                    SupplierID: null,
                    CategoryID: null,
                    QuantityPerUnit: "",
                    UnitPrice: null,
                    UnitsInStock: null,
                    UnitsOnOrder: null,
                    ReorderLevel: null,
                    Discontinued: false
                });
                this.getView().setModel(oNewProductModel, "newProduct");

                oDialog.setTitle("Add Item");
                this.byId("saveProductButton").setText("Add");

                oDialog.open();
            }.bind(this));
        },

        onSaveProduct: function () {
            var oNewProductModel = this.getView().getModel("newProduct");
            var oRawData = oNewProductModel.getData();
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

            oODataModel.create("/Products", oPayload, {
                success: function (oData) {
                    MessageToast.show("Product created successfully!");
                    this.byId("createProductDialog").close();
                }.bind(this),
                error: function (oError) {
                    MessageToast.show("Error creating product. Check console.");
                    console.error(oError);
                }
            });
        },

        onCancelProduct: function () {
            this.byId("createProductDialog").close();
        },
           onDeleteProduct: function (oEvent) {
            var oCtx = oEvent.getSource().getBindingContext();
            var sProductId = oCtx.getProperty("ProductID");
            var sProductName = oCtx.getProperty("ProductName");
            var sPath = oCtx.getPath();

            MessageBox.confirm(
                "Kya tum '" + sProductName + "' ko hamesha ke liye delete karna chahti ho?",
                {
                    title: "Confirm Delete",
                    onClose: function (sAction) {
                        if (sAction === MessageBox.Action.OK) {
                            this._deleteProduct(sPath, sProductName);
                        }
                    }.bind(this)
                }
            );
        },

        _deleteProduct: function (sPath, sProductName) {
            var oODataModel = this.getView().getModel();

            oODataModel.remove(sPath, {
                success: function () {
                    MessageToast.show(sProductName + " deleted successfully!");
                }.bind(this),
                error: function (oError) {
                    MessageToast.show("Error deleting product. Check console.");
                    console.error(oError);
                }
            });
        }
    });
});