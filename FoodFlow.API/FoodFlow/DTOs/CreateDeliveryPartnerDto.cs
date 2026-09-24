namespace FoodFlow.DTOs
{
    public class CreateDeliveryPartnerDto
    {
        public string Name { get; set; } = string.Empty;

        public string Email { get; set; } = string.Empty;

        public string Password { get; set; } = string.Empty;

        public string VehicleType { get; set; } = string.Empty;

        public string VehicleNumber { get; set; } = string.Empty;
    }
}