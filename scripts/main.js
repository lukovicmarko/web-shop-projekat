
//provera da li je korisnik logovan
if(sessionStorage.getItem("isActiveSession") != "true"){
	location.href = "index.html"
}

//url do funkcije web servisa koja vraca proizvode u json formatu
productsURL = "http://services.odata.org/V3/Northwind/Northwind.svc/Products?$format=json";

//url do funkcije web servisa koja vraca kategorije u json formatu
categoriesURL = "http://services.odata.org/V3/Northwind/Northwind.svc/Categories?$format=json";


//suma proizvoda iz korpe
var s = 0;
var korpa = [];
var products = [];
var imagePathOfNewProduct;

$(document).ready(function(){

	if(sessionStorage.getItem("isActiveSession") != "true"){
		location.href = "index.html"
	}else{
		
		$("#userDisplayName").text(sessionStorage.getItem("user"));
		$("#userTitle").text(sessionStorage.getItem("userTitle"));
		$("#userImage").attr("src",sessionStorage.getItem("userImage"));
		
		if(sessionStorage.getItem("userType")!= "admin"){
			$("#btnNewProduct").hide();
			$("#btnCart").show();
			$("#sumaInfo").show();			
			$("#cart").show();
		}else{
			$("#btnNewProduct").show();
			$("#btnCart").hide();
			$("#sumaInfo").hide();
			$("#cartSection").hide();
		}
		
		$.ajax({
			url: productsURL,
			dataType: "json",			
			success: function(productsResult){
				$.ajax({
					url: categoriesURL,
					dataType: "json",			
					success: function(categoriesResult){	
						products = productsResult.value;
						categories = categoriesResult.value;
						for(var i in products){
							products[i].CategoryName = getCategoryNameByCategoryId(products[i].CategoryID, categories);
							products[i].ImagePath = getImagePath();
							var datumKreiranja = new Date();
							products[i].CreationDate = datumKreiranja.toLocaleDateString();
							showProduct(products[i], "#products");
						}
						populateCategoryDropDown(categories);
					},
					error: function(error){
						alert(error.mesage);
					}
				});
			},
			error: function(error){
				alert(error.mesage);
			}
		});		
			
	}

	$("#searchCategory").change(function(){
		search();
	});
	
	$("#searchString").keyup(function(){
		search();
	});
	
	$( "#productCreationDate" ).datepicker({
	  onSelect: function(dateText){
            //document.getElementById("datum").innerHTML = dateText;
        }
    });
	
	
	$("#files").kendoUpload({
		async: {
			saveUrl: "save",
			removeUrl: "remove",
			autoUpload: true
		},
		validation: {
			allowedExtensions: [".jpg", ".jpeg", ".png", ".bmp", ".gif"]
		},
		success: onSuccess,
		error: onSuccess,
		showFileList: false,
		dropZone: ".dropZoneElement"
	});

	function onSuccess(e) {
		if (e.operation == "upload") {
			imagePathOfNewProduct = "images/products/" + e.files[e.files.length-1].name;
			$("#selectedProductImage").html("<div class='selectedProductImage'><img src=" + imagePathOfNewProduct + " /></div>");
		}
	}
	
			
});

/*vraca putanju random izabrane slike*/
function getImagePath(){	
	return "images/products/" + getRandomNumber(1,6) + ".jpg";
}

/*vraca slucajno izabrani ceo broj izmedju min i max */
function getRandomNumber(min, max){	
	return Math.round(Math.random() * (max - min)) + min;	
}

/*pronalazi proizvod u kolekciji proizvoda po atributu ProductID*/
function getProductByProductID(productId, products){
	var result;
	for(i in products){
		if(products[i].ProductID == productId){
			return products[i];
		}		
	}
	return result;
}

/*pronalazi ime kategorije u nizu kategorija po atributu CategoryID*/
function getCategoryNameByCategoryId(categoryId, categories){
	for(var i in categories){
		if(categories[i].CategoryID == categoryId){
			return categories[i].CategoryName;
		}
	}
}


/*pronalazi idex proizvoda u korpi po atributu ProductID*/
function getProductIndexInCartByProductId(productId, cart){
	var result = -1;
	for(var i in cart){
		if(cart[i].ProductID == productId){
			return i;
		}
	}
	return result;
}

/*dodavanje proizvoda u korpu*/
function dodaj(product, placeId){
	var id = product.id;

	var kolicinaId = "#kolicina" + placeId + id;

	var kolicina = new Number($(kolicinaId).val());
	
	if(kolicina < 1){
		alert("Za količinu morate uneti najmanje 1.");
		return;
	}
	
	var productForCart = getProductByProductID(id, products);
	var index = getProductIndexInCartByProductId(id, korpa);
	
	if(index == -1){
		productForCart.Quantity = kolicina;
		korpa.push(productForCart);
	}else{
		korpa[index].Quantity += kolicina;
	}
	
	s+= kolicina * productForCart.UnitPrice;
	showProducts(korpa, "#cart");
	$("#suma").text(s.toFixed(2));
	$("#kolicinaCart").text(korpa.length);
	$("#sumaCart").text(s.toFixed(2));
	
}

/*izbacivanje proizvoda iz korpe*/
function izbaci(product, placeId){
	var id = product.id;

	var kolicinaId = "#kolicina" + placeId + id;

	var kolicina = new Number($(kolicinaId).val());
	
	if(kolicina < 1){
		alert("Za količinu morate uneti najmanje 1.");
		return;
	}
	
	var index = getProductIndexInCartByProductId(id, korpa);
	
	if(index == -1){
		alert("Proizvod na postoji u korpi");
	}
	else if(korpa[index].Quantity < kolicina){
		alert("Nema dovoljno proizvoda u korpi");
	}
	else{
		korpa[index].Quantity -= kolicina;
		s-= kolicina * korpa[index].UnitPrice;
		if(korpa[index].Quantity == 0){
			korpa.splice(index,1);
		}
		
	}
	showProducts(korpa, "#cart");
	$("#suma").text(s.toFixed(2));
	$("#kolicinaCart").text(korpa.length);
	$("#sumaCart").text(s.toFixed(2));
}

/*popunjavanje drop-down liste kategorijama kao opcijama*/
function populateCategoryDropDown(categories){
	for(var i in categories){
		$('<option></option>',{
				value: categories[i].CategoryID,
				text: categories[i].CategoryName
		}).appendTo("#productCategory");
		$('<option></option>',{
				value: categories[i].CategoryID,
				text: categories[i].CategoryName
		}).appendTo("#searchCategory");		
	}
}

/*kreiranje novog proizvoda*/
function createNewProduct(){
	
	var newProductImage = imagePathOfNewProduct;
	var newProductName = $("#productName").val();
	var newProductPrice = $("#productPrice").val();
	var newProductCreationDate = $("#productCreationDate").val();
	var newProductCategory = getCategoryNameByCategoryId($("#productCategory").val(), categories);
	
	if(!checkValidation(newProductName, newProductPrice, newProductCategory)){
		return;
	}
	
	var productsCatalog = document.getElementById("products");
	
	var newProductId = productsCatalog.childElementCount + 1;
	
	var product = new Product(newProductId, newProductImage, newProductName, newProductPrice, newProductCategory, newProductCreationDate);
	
	products.push(product);
	
	showProduct(product, "#products");
}

/*validacija unosa u formi za unos novog proizvoda*/
function checkValidation(productName, productPrice, productCategory){
	if(productName == undefined || productName == '' || productPrice==undefined || productPrice<0 || productCategory == undefined){
		$("#productNameValidation").removeClass("hidden");
		$("#productPriceValidation").removeClass("hidden");
		$("#productCategoryValidation").removeClass("hidden");
		return false;
	}else{
		return true;
	}
}

/*prikaz proizvoda na zadatom mestu*/
function showProduct(product, place){
	
	var placeId = place.substr(1);
	var productsCatalog = document.getElementById(placeId);
	
	var productTemplate = document.createElement("DIV");
	productTemplate.setAttribute("id", placeId + product.ProductID);
	productTemplate.setAttribute("class","col-sm-4 product");
	productsCatalog.appendChild(productTemplate);
	
	var productImageElement = document.createElement("IMG");
	productImageElement.setAttribute("src",product.ImagePath);
	productImageElement.setAttribute("class","img-responsive");
	productImageElement.setAttribute("alt","");
	productTemplate.appendChild(productImageElement);
	
	var productNameElement = document.createElement("H4");
	productNameElement.innerHTML = product.ProductName;
	productTemplate.appendChild(productNameElement);
	
	var productCategoryElement = document.createElement("P");
	productCategoryElement.innerHTML = product.CategoryName;
	productTemplate.appendChild(productCategoryElement);
	
	var productPriceElement= document.createElement("P");
	productPriceElement.innerHTML = "Cena: ";
	productTemplate.appendChild(productPriceElement);

	var productPriceValueElement= document.createElement("SPAN");
	productPriceValueElement.setAttribute("id","cena" + placeId + product.ProductID);
	productPriceValueElement.innerHTML = product.UnitPrice;
	productPriceElement.appendChild(productPriceValueElement);
	
	var productCreationDateElement= document.createElement("P");
	productCreationDateElement.innerHTML = "Datum unosa: ";
	productTemplate.appendChild(productCreationDateElement);

	var productCreationDateValueElement= document.createElement("SPAN");
	productCreationDateValueElement.setAttribute("id","datumUnosa" + product.ProductID);
	productCreationDateValueElement.innerHTML = product.CreationDate;
	productCreationDateElement.appendChild(productCreationDateValueElement);

	
	if(sessionStorage.getItem("userType")!= "admin"){
		var productQuantityElement= document.createElement("INPUT");
		productQuantityElement.setAttribute("type","number");
		productQuantityElement.setAttribute("id","kolicina" + placeId + product.ProductID);
		productQuantityElement.setAttribute("min","1");
		productQuantityElement.setAttribute("value","1");
		productTemplate.appendChild(productQuantityElement);
		
		var breakElement= document.createElement("BR");
		productTemplate.appendChild(breakElement);
		
		var btnDodajElement= document.createElement("BUTTON");		
		btnDodajElement.setAttribute("id", product.ProductID);
		btnDodajElement.setAttribute("onclick","dodaj(this,'" + placeId + "')");
		btnDodajElement.innerHTML="Dodaj";
		productTemplate.appendChild(btnDodajElement);
		
		var btnIzbaciElement= document.createElement("BUTTON");
		btnIzbaciElement.setAttribute("id", product.ProductID);
		btnIzbaciElement.setAttribute("onclick","izbaci(this,'" + placeId + "')");
		btnIzbaciElement.innerHTML="Izbaci";
		productTemplate.appendChild(btnIzbaciElement);
	}
	
	//notifikacija o kolicini proizvoda u korpi
	if(place == "#cart"){		
		$("#" + placeId + product.ProductID).notify(
		  "Trenutno u korpi: " + product.Quantity, 
		  { position:"bottom left",
			className: 'success',
			clickToHide: true,
			autoHide: false}
		);
	}
	
}

/*konstruktorska funkcija za kreiranje proizvoda (object)*/
function Product(id, image, name, price, category, creationDate){
	
	this.ProductID = id;
	this.ImagePath = image;
	this.ProductName = name;
	this.UnitPrice = price;
	this.CategoryName = category;
	this.CreationDate = creationDate;
}

//search
function search(){
	
	var searchCategoryId = $("#searchCategory").val();
	var searchValue = $("#searchString").val().toLowerCase();

	if(searchCategoryId != "all"){
		products1 = getProductsByCategoryId(searchCategoryId, products);
		if(searchValue != ""){
			products2 = getProductsBySearchValue(searchValue, products1)
			showProducts(products2, "#products");
		}
		else{
			showProducts(products1, "#products");
		}
	}
	else{
		if(searchValue != ""){
			products1 = getProductsBySearchValue(searchValue, products)
			showProducts(products1, "#products");
		}
		else{
			showProducts(products,"#products");
		}
	}

}


//prikaz niza proizvoda na zadatom mestu
function showProducts(products, place){
	$(place).empty();
	for (var i in products){
		showProduct(products[i], place);
	}
}

//filtriranje niza proizvoda - vraca one koji u svom imenu ili imenu kategorije sadrze searchParam
function getProductsBySearchValue(searchParam, products){
	var result = [];
	for (var i in products){
		if(products[i].ProductName.toLowerCase().indexOf(searchParam)>-1 || products[i].CategoryName.toLowerCase().indexOf(searchParam)>-1){
			result.push(products[i]);
		}
	}

	return result;
}

//filtriranje niza proizvoda po id kategorije
function getProductsByCategoryId(categoryId, products){
	var result = [];
	for (var i in products){
		if(products[i].CategoryID == categoryId){
			result.push(products[i]);
		}
	}

	return result;
}



