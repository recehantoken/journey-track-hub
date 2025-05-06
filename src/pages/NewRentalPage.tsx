import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { toast } from "@/components/ui/sonner";
import { format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { Tables } from "@/integrations/supabase/types";
import { formatIDR } from "@/utils/format";

const NewRentalPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    renter_name: "",
    renter_phone: "",
    renter_address: "",
    destination: "",
    vehicle_id: "",
    driver_id: "",
    start_date: new Date(),
    end_date: new Date(),
    payment_price: "",
    payment_status: "pending" as Tables<"rentals">["payment_status"],
  });
  const [vehicles, setVehicles] = useState<Tables<"vehicles">[]>([]);
  const [drivers, setDrivers] = useState<Tables<"drivers">[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [vehiclesResult, driversResult] = await Promise.all([
          supabase
            .from("vehicles")
            .select("*")
            .eq("status", "available"),
          supabase
            .from("drivers")
            .select("*")
            .in("status", ["active", "on-duty"]),
        ]);

        if (vehiclesResult.error) throw vehiclesResult.error;
        if (driversResult.error) throw driversResult.error;

        setVehicles(vehiclesResult.data);
        setDrivers(driversResult.data);
      } catch (error) {
        console.error("Error fetching data:", error);
        toast("Failed to load vehicles or drivers", {
          description: "Please try again later.",
        });
      }
    };

    fetchData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { data: rentalData, error: rentalError } = await supabase
        .from("rentals")
        .insert({
          renter_name: formData.renter_name,
          renter_phone: formData.renter_phone,
          renter_address: formData.renter_address,
          destination: formData.destination,
          vehicle_id: formData.vehicle_id,
          driver_id: formData.driver_id,
          start_date: formData.start_date.toISOString(),
          end_date: formData.end_date.toISOString(),
          payment_price: parseFloat(formData.payment_price),
          payment_status: formData.payment_status,
        })
        .select()
        .single();

      if (rentalError) throw rentalError;

      toast("Rental created successfully", {
        description: "An invoice has been generated for this rental.",
      });
      navigate("/rentals");
    } catch (error) {
      console.error("Error creating rental:", error);
      toast("Failed to create rental", {
        description: "Please check your input and try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>Create New Rental</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="renter_name">Renter Name</Label>
              <Input
                id="renter_name"
                value={formData.renter_name}
                onChange={(e) =>
                  setFormData({ ...formData, renter_name: e.target.value })
                }
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="renter_phone">Renter Phone</Label>
              <Input
                id="renter_phone"
                value={formData.renter_phone}
                onChange={(e) =>
                  setFormData({ ...formData, renter_phone: e.target.value })
                }
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="renter_address">Renter Address</Label>
              <Input
                id="renter_address"
                value={formData.renter_address}
                onChange={(e) =>
                  setFormData({ ...formData, renter_address: e.target.value })
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="destination">Destination</Label>
              <Input
                id="destination"
                value={formData.destination}
                onChange={(e) =>
                  setFormData({ ...formData, destination: e.target.value })
                }
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="vehicle_id">Vehicle</Label>
              <Select
                value={formData.vehicle_id}
                onValueChange={(value) =>
                  setFormData({ ...formData, vehicle_id: value })
                }
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a vehicle" />
                </SelectTrigger>
                <SelectContent>
                  {vehicles.map((vehicle) => (
                    <SelectItem key={vehicle.id} value={vehicle.id}>
                      {vehicle.name} ({vehicle.license_plate}) - {formatIDR(vehicle.price)}/day
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="driver_id">Driver</Label>
              <Select
                value={formData.driver_id}
                onValueChange={(value) =>
                  setFormData({ ...formData, driver_id: value })
                }
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a driver" />
                </SelectTrigger>
                <SelectContent>
                  {drivers.map((driver) => (
                    <SelectItem key={driver.id} value={driver.id}>
                      {driver.full_name} ({driver.phone_number})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Start Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !formData.start_date && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.start_date ? (
                      format(formData.start_date, "PPP")
                    ) : (
                      <span>Pick a date</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={formData.start_date}
                    onSelect={(date) =>
                      date && setFormData({ ...formData, start_date: date })
                    }
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label>End Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !formData.end_date && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.end_date ? (
                      format(formData.end_date, "PPP")
                    ) : (
                      <span>Pick a date</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={formData.end_date}
                    onSelect={(date) =>
                      date && setFormData({ ...formData, end_date: date })
                    }
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label htmlFor="payment_price">Payment Price (IDR)</Label>
              <Input
                id="payment_price"
                type="number"
                value={formData.payment_price}
                onChange={(e) =>
                  setFormData({ ...formData, payment_price: e.target.value })
                }
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="payment_status">Payment Status</Label>
              <Select
                value={formData.payment_status}
                onValueChange={(value) =>
                  setFormData({
                    ...formData,
                    payment_status: value as Tables<"rentals">["payment_status"],
                  })
                }
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select payment status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="paid">Paid</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex justify-end gap-4">
              <Button
                variant="outline"
                onClick={() => navigate("/rentals")}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Creating..." : "Create Rental"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default NewRentalPage;