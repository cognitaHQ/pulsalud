<div class="modal fade" id="myModal" tabindex="-1" role="dialog" aria-labelledby="myModalLabel" aria-hidden="true">
	<div class="modal-dialog">
		<div class="modal-content">
			<div class="modal-header">
				Agregar email <button type="button" class="close" data-dismiss="modal"><span aria-hidden="true">&times;</span><span class="sr-only">Close</span></button>
				<h4 class="modal-title" id="myModalLabel">Agrega tu email para recibir nuevas actualizaciones de nuestro sistema.
				</h4>
			</div>
			<div class="modal-body">

					<div class="form-group">
						<label>Nombre:</label><input type="text" name="nombre" id="nombre" class="form-control" value="" required="required" pattern="" title="" data-bv-notempty="true"
                                data-bv-notempty-message="The email address is required and cannot be empty">
						<label>Email:</label><input type="email" name="email" id="email" class="form-control" value="" required="required" title="" data-bv-notempty="true"
                                data-bv-notempty-message="The email address is required and cannot be empty"

                                data-bv-emailaddress="true"
                                data-bv-emailaddress-message="The email address is not a valid" >
					</div>
			</div>
			<div class="modal-footer">
				<button type="button" class="btn btn-default" data-dismiss="modal">Close</button>
				<button type="button" id="saveEmail" class="btn btn-primary">Save changes</button>
			</div>
		</div>
	</div>
</div>
<script>
(function(){
	$("#saveEmail").on("click", function(){
		$(this).attr("disabled", true);
		var name = $("#nombre").val(),
			email = $("#email").val();
		var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;    
		if(name === "" || email === "" || !re.test(email)){
			alert("Nombre o email incompleto");
			$(this).attr("disabled", null);
			return;
		}
		$.ajax({url: "/addEmail",
				type: "POST",
				data: {email: email, name: name},
				dataType: "json",
				success: function(d){
					if(d.success == true){
						alert("Email registrado");
						location.reload();
					}else{
						alert("Ocurrió un error. Intente más tarde");
					}
					$(this).attr("disabled", null);

				},
				error: function(){
					alert("No se ha podido guardar la información");
					$(this).attr("disabled", null);
				}
		});
		$(this).attr("disabled", null);
	})
})();
</script>
<footer>
Made with <a href='https://github.com/alangrafu/flod'>Flod</a>
</footer>